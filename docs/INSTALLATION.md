# BESP2074 installieren und starten

[English](./INSTALLATION_EN.md)

Diese Anleitung ist für Nutzer gedacht, die das Projekt lokal auf dem eigenen Computer starten möchten. BESP2074 ist keine normale Website und keine GitHub-Pages-App. Das Dashboard läuft im Browser, braucht aber im Hintergrund einen kleinen lokalen Python-Dienst.

## 1. Voraussetzungen installieren

Installiere zuerst diese Programme:

- Python 3.10 oder neuer: <https://www.python.org/downloads/>
- Git for Windows: <https://git-scm.com/download/win>

Beim Python-Installer sollte die Option `Add python.exe to PATH` aktiviert sein. Danach PowerShell neu öffnen.

Prüfen:

```powershell
python --version
git --version
```

Wenn `python --version` nicht funktioniert, versuche:

```powershell
py --version
```

## 2. Projekt herunterladen

Öffne PowerShell und wechsle zum Desktop:

```powershell
cd "$env:USERPROFILE\Desktop"
```

Projekt von GitHub herunterladen:

```powershell
git clone https://github.com/AleksZyro/BESP2074.git
cd BESP2074
```

## 3. Lokale Python-Umgebung erstellen

Diese Umgebung hält die benötigten Python-Pakete im Projektordner und verändert nicht das restliche System.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

Falls dein Computer nur den Befehl `py` kennt:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

## 4. Dashboard starten

```powershell
.\.venv\Scripts\python.exe tools\local_run_service.py --port 8011
```

Das PowerShell-Fenster muss offen bleiben, solange du BESP2074 benutzt.

Öffne danach im Browser:

- Dashboard: <http://127.0.0.1:8011/dashboard/index.html>
- Grenzeditor: <http://127.0.0.1:8011/dashboard/editor.html>

## 5. Projekt später erneut starten

Wenn das Projekt schon installiert ist, musst du nicht alles wiederholen. Öffne PowerShell:

```powershell
cd "$env:USERPROFILE\Desktop\BESP2074"
.\.venv\Scripts\python.exe tools\local_run_service.py --port 8011
```

Danach wieder öffnen:

<http://127.0.0.1:8011/dashboard/index.html>

## Häufige Probleme

### `python` wird nicht erkannt

Installiere Python erneut und aktiviere `Add python.exe to PATH`. Danach PowerShell neu öffnen.

### Port 8011 ist schon belegt

Starte BESP2074 mit einem anderen Port:

```powershell
.\.venv\Scripts\python.exe tools\local_run_service.py --port 8012
```

Dann diese Adresse öffnen:

<http://127.0.0.1:8012/dashboard/index.html>

### Das Browserfenster zeigt nichts

Prüfe, ob PowerShell noch läuft und keine Fehlermeldung anzeigt. Der lokale Python-Dienst muss aktiv sein.

### Ich möchte neu herunterladen

Wenn du den Ordner löschen und neu starten willst:

```powershell
cd "$env:USERPROFILE\Desktop"
git clone https://github.com/AleksZyro/BESP2074.git
```

Falls der Ordner `BESP2074` schon existiert, benenne ihn vorher um oder lösche ihn bewusst.
