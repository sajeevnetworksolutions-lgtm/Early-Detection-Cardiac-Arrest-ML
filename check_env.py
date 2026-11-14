import sys

packages = [
    'numpy', 'pandas', 'scipy', 'sklearn', 'fastapi', 
    'uvicorn', 'pydantic', 'torch', 'wfdb', 'neurokit2', 
    'reportlab', 'matplotlib', 'seaborn', 'joblib'
]

print(f"Python: {sys.version}")
for pkg in packages:
    try:
        m = __import__(pkg)
        ver = getattr(m, '__version__', 'unknown')
        print(f"  {pkg}: {ver}")
    except ImportError as e:
        print(f"  {pkg}: NOT INSTALLED ({e})")
