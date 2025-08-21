# 这里是别人已经搭建好的的一个pupptr运行换季环境                                                           
FROM buildkite/puppeteer                                                                         
                                                                                                 
WORKDIR /app                                                                                     
                                                                                                 
# 把当当前目录的模样   所有内容都拷贝到 app工作目录                                                                   
COPY . /app                                                                                      
                                                                                                 
                                                                                                 
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion


nvm install 18

nvm use 18
                                                                                                 
# 完成  