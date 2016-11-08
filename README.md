# RPi-Node
Project_malhanda의 Raspberry Pi 모듈 ***'듣는다'***의 Node 서버단 Repository입니다.

# Requires
* Node.js
	* Express : Web application Framework
	* Mocha : TDD Framework for Node.js
* MongoDB : Plug DB
* KoNLPy : 한국어 형태소 분석 Python package

# Installation
## Node.js
apt-get으로 설치하는 것보다 NVM(Node Version Manager)를 사용해 설치하는 것이 더 안정적

#### NVM 설치

	$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
	$ source ~/.nvm/nvm.sh	

#### Node.js 설치
	$ nvm install node (최신 stable 버전 설치)
	$ nvm ls (설치된 버전 확인)
	
#### npm 설치
	$ sudo apt-get install npm
	