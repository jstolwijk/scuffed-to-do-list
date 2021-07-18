Write-Output "Starting deploy script....."
scp 'C:\Users\Jesse\Projects\idea-box\backend\src\*.ts' root@188.166.27.58:~/app/src
scp 'C:\Users\Jesse\Projects\idea-box\backend\*.json' root@188.166.27.58:~/app/
Write-Output "Files transferred to target machine"
ssh root@188.166.27.58 "cd ~/app && yarn install && yarn run build"
Write-Output "Application built"
ssh root@188.166.27.58 "pm2 stop socket-server"
ssh root@188.166.27.58 "pm2 start ~/app/dist/socket-server.js"
Write-Output ""
Write-Output "Application started"
Write-Output ""
Write-Output "Let's check if it is actually running....."
ssh root@188.166.27.58 "curl localhost:8080/health"
