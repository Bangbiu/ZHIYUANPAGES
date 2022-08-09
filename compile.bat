echo compiling
tsc -t ES2020 -p tsconfig.json

echo moving
del .\lib\*.js
move .\tslib\*.js .\lib\.

pause
