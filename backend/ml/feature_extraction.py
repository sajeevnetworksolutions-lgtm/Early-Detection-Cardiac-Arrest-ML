"""
Feature Extraction Module
ECG Morphological, HRV (Time & Frequency Domain), and Physiological Vitals
SSIT M.Tech Academic Research
"""

import numpy as np
from scipy import signal
from typing import Dict, Any, List, Optional

class FeatureExtractor:
    """
    Extracts clinical features from ECG signals and physiological streams:
    - Time-domain RR and Heart Rate Variability (HRV): Mean RR, SDNN, RMSSD, pNN50
    - Frequency-domain HRV: LF, HF, LF/HF ratio (sympathovagal balance)
    - Morphological QRS characteristics: QRS width, peak-to-peak amplitude
    - Signal statistical metrics: Variance, Skewness, Kurtosis, Shannon Entropy
    """

    def __init__(self, sampling_rate: int = 360):
        self.fs = sampling_rate

    def extract_hrv_features(self, r_peaks: List[int]) -> Dict[str, float]:
        """
        Calculates time-domain and frequency-domain HRV indices from detected R-peaks.
        """
        if len(r_peaks) < 3:
            return {
                "mean_hr_bpm": 0.0,
                "mean_rr_ms": 0.0,
                "std_rr_ms": 0.0,
                "sdnn_ms": 0.0,
                "rmssd_ms": 0.0,
                "pnn50_pct": 0.0,
                "lf_power": 0.0,
                "hf_power": 0.0,
                "lf_hf_ratio": 0.0
            }

        # Convert peak sample indices to RR intervals in milliseconds
        rr_samples = np.diff(r_peaks)
        rr_ms = (rr_samples / self.fs) * 1000.0

        # Physiological filtering (keep RR between 300ms and 2000ms: 30-200 bpm)
        valid_rr = rr_ms[(rr_ms >= 300) & (rr_ms <= 2000)]
        if len(valid_rr) < 2:
            valid_rr = rr_ms

        mean_rr = float(np.mean(valid_rr))
        std_rr = float(np.std(valid_rr))
        mean_hr = 60000.0 / mean_rr if mean_rr > 0 else 0.0

        # SDNN (Standard deviation of NN intervals)
        sdnn = std_rr

        # RMSSD (Root mean square of successive differences)
        successive_diffs = np.diff(valid_rr)
        rmssd = float(np.sqrt(np.mean(successive_diffs ** 2))) if len(successive_diffs) > 0 else 0.0

        # pNN50 (Percentage of differences > 50ms)
        nn50 = np.sum(np.abs(successive_diffs) > 50) if len(successive_diffs) > 0 else 0
        pnn50 = float((nn50 / len(successive_diffs)) * 100.0) if len(successive_diffs) > 0 else 0.0

        # Frequency Domain HRV via Lomb-Scargle or resampled FFT/Welch
        # Resample RR series at 4Hz interpolation
        lf_power, hf_power, lf_hf_ratio = self._calculate_spectral_hrv(valid_rr)

        return {
            "mean_hr_bpm": round(mean_hr, 2),
            "mean_rr_ms": round(mean_rr, 2),
            "std_rr_ms": round(std_rr, 2),
            "sdnn_ms": round(sdnn, 2),
            "rmssd_ms": round(rmssd, 2),
            "pnn50_pct": round(pnn50, 2),
            "lf_power": round(lf_power, 4),
            "hf_power": round(hf_power, 4),
            "lf_hf_ratio": round(lf_hf_ratio, 3)
        }

    def _calculate_spectral_hrv(self, rr_ms: np.ndarray) -> (float, float, float):
        """
        Computes Low Frequency (0.04-0.15 Hz) and High Frequency (0.15-0.4 Hz) spectral power.
        """
        if len(rr_ms) < 4:
            return 0.0, 0.0, 1.0

        time_cum = np.cumsum(rr_ms) / 1000.0 # seconds
        t_resamp = np.arange(time_cum[0], time_cum[-1], 0.25) # 4 Hz resampling
        if len(t_resamp) < 8:
            return 0.01, 0.01, 1.0

        rr_interp = np.interp(t_resamp, time_cum, rr_ms)
        rr_detrend = rr_interp - np.mean(rr_interp)

        freqs, psd = signal.welch(rr_detrend, fs=4.0, nperseg=min(len(rr_detrend), 64))

        lf_band = (freqs >= 0.04) & (freqs < 0.15)
        hf_band = (freqs >= 0.15) & (freqs <= 0.40)

        lf = float(np.trapz(psd[lf_band], freqs[lf_band])) if np.any(lf_band) else 0.001
        hf = float(np.trapz(psd[hf_band], freqs[hf_band])) if np.any(hf_band) else 0.001
        ratio = float(lf / max(1e-5, hf))

        return max(1e-4, lf), max(1e-4, hf), min(20.0, ratio)

    def extract_morphological_features(self, clean_signal: np.ndarray, r_peaks: List[int]) -> Dict[str, float]:
        """
        Extracts QRS morphology characteristics and signal statistical parameters.
        """
        if len(r_peaks) == 0:
            return {
                "qrs_duration_ms": 80.0,
                "qrs_amplitude_mv": 1.2,
                "signal_variance": float(np.var(clean_signal)),
                "shannon_entropy": 0.0
            }

        # Estimate average QRS duration around R-peaks
        half_qrs_samples = int(0.06 * self.fs) # 60ms window
        durations = []
        amplitudes = []

        for p in r_peaks:
            start = max(0, p - half_qrs_samples)
            end = min(len(clean_signal), p + half_qrs_samples)
            segment = clean_signal[start:end]
            if len(segment) > 4:
                peak_val = clean_signal[p]
                min_val = np.min(segment)
                amp = peak_val - min_val
                amplitudes.append(amp)
                # Full width at half maximum (FWHM)
                half_max = min_val + amp * 0.5
                above_half = np.where(segment >= half_max)[0]
                if len(above_half) > 0:
                    dur_ms = (len(above_half) / self.fs) * 1000.0
                    durations.append(dur_ms)

        mean_dur = float(np.mean(durations)) if durations else 85.0
        mean_amp = float(np.mean(amplitudes)) if amplitudes else 1.25

        # Signal Shannon Entropy
        hist, _ = np.histogram(clean_signal, bins=30, density=True)
        hist = hist[hist > 0]
        entropy = float(-np.sum(hist * np.log2(hist)))

        return {
            "qrs_duration_ms": round(mean_dur, 2),
            "qrs_amplitude_mv": round(mean_amp, 3),
            "signal_variance": round(float(np.var(clean_signal)), 4),
            "shannon_entropy": round(entropy, 3)
        }

    def extract_all_ecg_features(self, clean_signal: np.ndarray, r_peaks: List[int]) -> Dict[str, Any]:
        """
        Aggregates all ECG features into a standardized clinical feature vector.
        """
        hrv_feats = self.extract_hrv_features(r_peaks)
        morph_feats = self.extract_morphological_features(clean_signal, r_peaks)
        combined = {**hrv_feats, **morph_feats}
        return combined

    @staticmethod
    def get_feature_dictionary() -> List[Dict[str, str]]:
        """
        Returns academic explanation of every extracted feature for clinical documentation.
        """
        return [
            {"feature": "mean_hr_bpm", "category": "Vital / Rate", "formula": "60,000 / Mean(RR_ms)", "clinical_utility": "Detects tachycardia (>100 bpm) or bradycardia (<60 bpm), pivotal in acute cardiac distress."},
            {"feature": "mean_rr_ms", "category": "Time Domain", "formula": "Mean of adjacent R-to-R intervals", "clinical_utility": "Base cardiac cycle timing interval."},
            {"feature": "sdnn_ms", "category": "HRV", "formula": "sqrt(1/N * sum((RR_i - Mean_RR)^2))", "clinical_utility": "Gold-standard total HRV metric. Values < 50ms indicate severe autonomic failure and elevated cardiac mortality risk."},
            {"feature": "rmssd_ms", "category": "HRV", "formula": "sqrt(1/(N-1) * sum((RR_{i+1} - RR_i)^2))", "clinical_utility": "Reflects parasympathetic (vagal) regulation. Markedly reduced prior to cardiac arrest and ventricular arrhythmias."},
            {"feature": "pnn50_pct", "category": "HRV", "formula": "(Count(|RR_{i+1} - RR_i| > 50ms) / Total_RR) * 100", "clinical_utility": "Vagal tone marker, highly sensitive to autonomic balance breakdown."},
            {"feature": "lf_power", "category": "Frequency Domain", "formula": "Integral PSD from 0.04 to 0.15 Hz", "clinical_utility": "Sympathetic and baroreflex modulation."},
            {"feature": "hf_power", "category": "Frequency Domain", "formula": "Integral PSD from 0.15 to 0.40 Hz", "clinical_utility": "Respiratory sinus arrhythmia (vagal parasympathetic drive)."},
            {"feature": "lf_hf_ratio", "category": "Frequency Domain", "formula": "LF / HF", "clinical_utility": "Sympathovagal balance. Extreme elevations indicate acute sympathetic crisis preceding ventricular instability."},
            {"feature": "qrs_duration_ms", "category": "Morphology", "formula": "Full width at half max of QRS wave", "clinical_utility": "QRS prolongation (>120ms) signifies bundle branch block, ventricular hypertrophy, or ventricular ectopy."},
            {"feature": "qrs_amplitude_mv", "category": "Morphology", "formula": "R_peak_height - Q/S_nadir", "clinical_utility": "Low amplitude may indicate pericardial effusion, ischemia, or severe myocardial impairment."},
            {"feature": "shannon_entropy", "category": "Nonlinear / Statistical", "formula": "-sum(p * log2(p))", "clinical_utility": "Loss of physiological complexity and information content precedes sudden cardiac collapse."}
        ]
