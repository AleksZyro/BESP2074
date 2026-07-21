# Installing and Starting BESP2074

[Deutsch](./INSTALLATION.md)

This guide is for users who want to run the project locally on their own computer. BESP2074 is not a normal website and not a GitHub Pages app. The dashboard opens in the browser, but it needs a small local Python service running in the background.

## 1. Install Requirements

Install these programs first:

- Python 3.10 or newer: <https://www.python.org/downloads/>
- Git for Windows: <https://git-scm.com/download/win>

In the Python installer, enable `Add python.exe to PATH`. Then open PowerShell again.

Check the installation:

```powershell
python --version
git --version
```

If `python --version` does not work, try:

```powershell
py --version
```

## 2. Download the Project

Open PowerShell and go to the Desktop:

```powershell
cd "$env:USERPROFILE\Desktop"
```

Download the project from GitHub:

```powershell
git clone https://github.com/AleksZyro/BESP2074.git
cd BESP2074
```

## 3. Create a Local Python Environment

This environment keeps the required Python packages inside the project folder and does not change the rest of the system.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

If your computer only recognises the `py` command:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

## 4. Start the Dashboard

```powershell
.\.venv\Scripts\python.exe tools\local_run_service.py --port 8011
```

Keep the PowerShell window open while using BESP2074.

Then open in the browser:

- Dashboard: <http://127.0.0.1:8011/dashboard/index.html>
- Boundary editor: <http://127.0.0.1:8011/dashboard/editor.html>

## 5. Start the Project Again Later

If the project is already installed, you do not need to repeat every step. Open PowerShell:

```powershell
cd "$env:USERPROFILE\Desktop\BESP2074"
.\.venv\Scripts\python.exe tools\local_run_service.py --port 8011
```

Then open:

<http://127.0.0.1:8011/dashboard/index.html>

## Common Problems

### `python` is not recognised

Install Python again and enable `Add python.exe to PATH`. Then open PowerShell again.

### Port 8011 is already in use

Start BESP2074 with another port:

```powershell
.\.venv\Scripts\python.exe tools\local_run_service.py --port 8012
```

Then open this address:

<http://127.0.0.1:8012/dashboard/index.html>

### The browser page is empty

Check whether PowerShell is still running and whether it shows an error message. The local Python service must stay active.

### I want to download it again

If you want to delete the folder and start again:

```powershell
cd "$env:USERPROFILE\Desktop"
git clone https://github.com/AleksZyro/BESP2074.git
```

If the `BESP2074` folder already exists, rename it first or delete it deliberately.
