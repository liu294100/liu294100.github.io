
---

## ��ΰ�װ Nativefier �������ҳ������Ӧ��

### ? һ����װ Nativefier
Nativefier ��һ������ Node.js �Ĺ��ߣ�ͨ�� npm ��װ����ʹ�á�

#### ?? ǰ��Ҫ��
�ڰ�װ Nativefier ֮ǰ��ȷ�����ϵͳ�Ѱ�װ���������
- **Node.js**����װ����Դ� npm��
  
��֤��װ�Ƿ�ɹ���
```bash
node -v   # ��ʾ Node.js �汾
npm -v    # ��ʾ npm �汾
```

#### ?? ��װ Nativefier��ȫ�ְ�װ��
���նˣ�Windows �� CMD/PowerShell��macOS/Linux �� Terminal�������У�
```bash
npm install -g nativefier
```
��װ��ɺ���������ն�ֱ��ʹ�� `nativefier` ���

---

### ?? �������������ҳ
��������ҳ���������Ӧ�õĲ���ܼ򵥡�

#### ?? ���������ʽ
```bash
nativefier "https://example.com" --name "YourAppName"
```

#### ? ʾ��
��� StackEdit ���� Markdown �༭����
```bash
nativefier "https://stackedit.io/app" --name "Markdown Online Editor"
```
- ���ã��� `https://stackedit.io/app` ���������Ӧ�á�
- Ӧ�����ƣ�`Markdown Online Editor`��
- ���������õĳ���ᱣ���ڵ�ǰĿ¼�µ����ļ����У����� `./Markdown Online Editor-win32-x64/`��

#### ?? ��ѡ��ǿ����
������һЩ���õĲ��������Ը�����Ҫ��ӵ������У�
| ����                  | ˵��                       |
|-----------------------|----------------------------|
| `--platform windows/mac/linux` | ָ��Ŀ��ƽ̨��֧�ֿ�ƽ̨����� |
| `--arch x64/arm64`    | ָ���ܹ�                  |
| `--icon icon.png`     | �Զ���Ӧ��ͼ��            |
| `--inject your.css`   | ע���Զ��� CSS ��ʽ        |
| `--disable-dev-tools` | ���ÿ����߹���            |
| `--single-instance`   | ����Ӧ��ֻ�����е�һʵ��   |
| `--tray`              | ���ϵͳ����֧��          |

#### ?? ������
- Ĭ�����·������ǰ����Ŀ¼�µ����ļ��У����� `./Markdown Online Editor-win32-x64/`��
- �ļ����ݣ�������ִ���ļ����� `.exe` �� `.app`����ֱ��˫���������С�

---

### ?? ����������� HTML �ļ�
������������ص� HTML �ļ�������������ҳ������Ҫ��΢�������

#### ?? �����ʽ
```bash
nativefier --name "YourAppName" "file://����·��/��/yourfile.html"
```

#### ? ʾ��
��������һ�����ص� `index.html` �ļ�λ�� `C:/Projects/mywebsite/index.html`��
```bash
nativefier --name "My Offline App" "file://C:/Projects/mywebsite/index.html"
```
- ���ã������ص� `index.html` �ļ����������Ӧ�á�
- ע�⣺
  - ·��������**����·��**��
  - Windows ·��ʹ����б�� `/`������ `file://` ��ͷ��
  - ��� HTML �ļ������˱�����Դ���� CSS��JS��ͼƬ����ȷ����Щ��Դ·���� HTML �������·�������� `index.html` ��ͬһĿ¼�ṹ�¡�

#### ?? ��ǿ����
��������ҳ������ƣ�����ʹ�� `--icon`��`--platform` �Ȳ��������磺
```bash
nativefier --name "My Offline App" --icon "C:/Projects/mywebsite/icon.png" "file://C:/Projects/mywebsite/index.html"
```

---

### ?? �ġ��Զ����ű�����ѡ��
����㾭������������ýű��򻯲�����

#### Windows ʾ����`.bat` �ļ���
����һ�� `pack.bat` �ļ���
```bat
@echo off
set URL=https://stackedit.io/app
set NAME=Markdown Online Editor
set ICON=C:/path/to/icon.png
nativefier "%URL%" --name "%NAME%" --icon "%ICON%"
pause
```
- �����˫�����м��ɴ����

#### macOS/Linux ʾ����`.sh` �ļ���
����һ�� `pack.sh` �ļ���
```bash
#!/bin/bash
URL="https://stackedit.io/app"
NAME="Markdown Online Editor"
ICON="/path/to/icon.png"
nativefier "$URL" --name "$NAME" --icon "$ICON"
```
- ����ǰ����ִ��Ȩ�ޣ�`chmod +x pack.sh`��Ȼ�� `./pack.sh` ִ�С�

---

---
---
---

