"""
Biomedical ECG Signal Processing Module
Butterworth Filtering, Baseline Wander Removal, QRS Detection, Beat Segmentation
SSIT M.Tech Academic Research
"""

import numpy as np
from scipy import signal
from typing import Dict, Any, List, Tuple, Optional

class ECGProcessor:
    """
    Implements standard clinical biomedical signal processing pipeline for ECG:
    1. Bandpass Butterworth filtering (0.5 - 40 Hz)
    2. Powerline notch filtering (50 Hz / 60 Hz)
    3. Baseline wander suppression
    4. Adaptive QRS / R-peak detection
    5. Beat segmentation and normalization
    6. Signal Quality Index (SQI) evaluation
    """

    def __init__(self, sampling_rate: int = 360):
        self.fs = sampling_rate

    def bandpass_filter(self, data: np.ndarray, lowcut: float = 0.5, highcut: float = 40.0, order: int = 3) -> np.ndarray:
        """
        Zero-phase forward-backward Butterworth bandpass filter.
        """
        nyquist = 0.5 * self.fs
        low = lowcut / nyquist
        high = highcut / nyquist
        # Ensure cutoff frequencies stay strictly inside (0, 1)
        low = max(0.001, min(0.99, low))
        high = max(low + 0.01, min(0.999, high))
        b, a = signal.butter(order, [low, high], btype="bandpass")
        filtered = signal.filtfilt(b, a, data)
        return filtered

    def notch_filter(self, data: np.ndarray, notch_freq: float = 50.0, quality_factor: float = 30.0) -> np.ndarray:
        """
        IIR Notch filter to eliminate 50Hz or 60Hz powerline interference.
        """
        nyquist = 0.5 * self.fs
        w0 = notch_freq / nyquist
        if w0 >= 1.0 or w0 <= 0:
            return data
        b, a = signal.iirnotch(w0, quality_factor)
        filtered = signal.filtfilt(b, a, data)
        return filtered

    def remove_baseline_wander(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Removes respiratory baseline wander using median filtering (or 0.5Hz highpass).
        Returns: (baseline_corrected_signal, estimated_baseline)
        """
        # Two-stage median filter: 200ms window then 600ms window
        win1 = int(0.2 * self.fs)
        if win1 % 2 == 0:
            win1 += 1
        win2 = int(0.6 * self.fs)
        if win2 % 2 == 0:
            win2 += 1

        baseline = signal.medfilt(data, kernel_size=min(win1, len(data) - 1 if len(data) % 2 == 0 else len(data)))
        baseline = signal.medfilt(baseline, kernel_size=min(win2, len(baseline) - 1 if len(baseline) % 2 == 0 else len(baseline)))
        corrected = data - baseline
        return corrected, baseline

    def preprocess_signal(self, raw_signal: np.ndarray) -> Dict[str, Any]:
        """
        Executes end-to-end signal conditioning.
        """
        raw = np.asarray(raw_signal, dtype=float)

        # Step 1: Notch filter powerline
        notched = self.notch_filter(raw, notch_freq=50.0)

        # Step 2: Bandpass filter 0.5 - 40 Hz
        bandpassed = self.bandpass_filter(notched, lowcut=0.5, highcut=40.0)

        # Step 3: Baseline correction
        clean, baseline = self.remove_baseline_wander(bandpassed)

        # Calculate SNR and noise reduction
        noise_est = raw - clean
        noise_power = np.mean(noise_est ** 2)
        signal_power = np.mean(clean ** 2)
        snr_db = float(10 * np.log10(max(1e-6, signal_power / max(1e-6, noise_power))))

        # Detect R-peaks
        r_peaks = self.detect_r_peaks(clean)

        return {
            "sampling_rate": self.fs,
            "signal_length": len(raw),
            "duration_sec": round(len(raw) / self.fs, 2),
            "snr_db": round(snr_db, 2),
            "raw_signal": raw,
            "filtered_signal": clean,
            "baseline": baseline,
            "detected_r_peaks": r_peaks
        }

    def detect_r_peaks(self, clean_signal: np.ndarray) -> List[int]:
        """
        Robust Pan-Tompkins inspired R-peak detection.
        Uses derivative, squaring, moving integration and adaptive peak thresholding.
        """
        if len(clean_signal) < int(self.fs * 0.5):
            return []

        # 1. 5-point derivative
        diff = np.diff(clean_signal)
        # 2. Squaring
        squared = diff ** 2
        # 3. Moving integration window (150ms)
        win_size = int(0.15 * self.fs)
        kernel = np.ones(win_size) / win_size
        integrated = np.convolve(squared, kernel, mode="same")

        # 4. Adaptive thresholding via find_peaks
        min_distance = int(0.25 * self.fs) # Physiological refractory period ~250ms (max 240 bpm)
        height_thresh = np.mean(integrated) + 0.5 * np.std(integrated)

        peaks, _ = signal.find_peaks(integrated, distance=min_distance, height=height_thresh)

        # Fine-tune peak location to find actual local maximum on clean_signal
        refined_peaks = []
        search_radius = int(0.08 * self.fs)
        for p in peaks:
            start = max(0, p - search_radius)
            end = min(len(clean_signal), p + search_radius)
            if start < end:
                actual_peak = start + int(np.argmax(clean_signal[start:end]))
                if not refined_peaks or (actual_peak - refined_peaks[-1] >= min_distance):
                    refined_peaks.append(actual_peak)

        return refined_peaks

    def segment_heartbeats(
        self, clean_signal: np.ndarray, r_peaks: List[int], pre_ms: int = 250, post_ms: int = 400
    ) -> Tuple[np.ndarray, List[int]]:
        """
        Segments continuous ECG signal into individual heartbeat complexes centered at R-peak.
        Returns: (beats_array of shape [N, samples_per_beat], valid_peak_indices)
        """
        pre_samples = int((pre_ms / 1000.0) * self.fs)
        post_samples = int((post_ms / 1000.0) * self.fs)
        beat_len = pre_samples + post_samples

        beats = []
        valid_peaks = []

        for p in r_peaks:
            start = p - pre_samples
            end = p + post_samples
            if start >= 0 and end <= len(clean_signal):
                beat = clean_signal[start:end]
                # Normalize beat to zero mean and unit variance
                beat_norm = (beat - np.mean(beat)) / (np.std(beat) + 1e-6)
                beats.append(beat_norm)
                valid_peaks.append(p)

        if not beats:
            return np.empty((0, beat_len)), []

        return np.array(beats), valid_peaks

    def calculate_sqi(self, clean_signal: np.ndarray) -> Dict[str, float]:
        """
        Computes Signal Quality Indices (SQI):
        - Kurtosis SQI (kSQI): standard peakedness
        - Skewness SQI (sSQI)
        - Relative Power SQI (pSQI): Ratio of QRS energy (5-15 Hz) to total signal energy
        """
        # Kurtosis & Skewness
        mean = np.mean(clean_signal)
        std = np.std(clean_signal) + 1e-8
        skewness = float(np.mean(((clean_signal - mean) / std) ** 3))
        kurtosis = float(np.mean(((clean_signal - mean) / std) ** 4))

        # Power spectral density via Welch
        freqs, psd = signal.welch(clean_signal, fs=self.fs, nperseg=min(len(clean_signal), int(2 * self.fs)))
        qrs_band = (freqs >= 5.0) & (freqs <= 15.0)
        total_band = (freqs >= 0.5) & (freqs <= 40.0)

        qrs_power = np.sum(psd[qrs_band])
        total_power = np.sum(psd[total_band]) + 1e-8
        psqi = float(qrs_power / total_power)

        quality_score = "Good" if psqi > 0.45 and kurtosis > 3.0 else ("Acceptable" if psqi > 0.25 else "Poor / Noisy")

        return {
            "kurtosis_sqi": round(kurtosis, 3),
            "skewness_sqi": round(skewness, 3),
            "relative_power_sqi": round(psqi, 3),
            "quality_grade": quality_score
        }
