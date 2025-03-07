Git 中文乱码问题

如果遇到 Git 提交信息或文件名中的中文显示乱码，可以通过以下步骤解决：

1. 配置 Git 的字符编码设置：
```bash
git config --global core.quotepath false
git config --global gui.encoding utf-8
git config --global i18n.commit.encoding utf-8
git config --global i18n.logoutputencoding utf-8