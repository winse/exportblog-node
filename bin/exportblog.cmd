@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\exportblog" %*
) ELSE (
  node  "%~dp0\exportblog" %*
)