# Jayculator:
The solution contains two projects a) Jayculator.App and b) Jayculator.WebApi.

a) Jayculator.App:
This app is a simple AngularJS 1.8 project. This app connects with 
Jayculator.Webapi using the hardcoded url, Which is 'https://localhost:44396/api/Jayculator'.
This value is hardcoded as 'jayculatorUri'(variable name) in the file at ~/src/js/JayculatorController.js 

I have used 'Live-Server' as my development webserver and the calculator file is at ~/src/Jayculator.html.
To use Live-Server to run the project and see the output, please 
use: 'live-server --open=src/jayculator.html

b) Jayculator.WebApi:
This ASP.Net Core WebAPI 3.1 project is confiugured to run in IISExpress by default at port 44396. 
Also by default this project is supposed to be running on the same machine as Jayculator.App runs. 
This project uses SQLite v3 for persisting the audit details. Here I am using Dapper as ORM.
When the project is run it checks for the file at the root directory and if not found creates one and table thereof.

Tech-in-Use(Keywords): ASP.net Core 3.1, WebAPI, IIS Express, SQLLite v3, Dapper, AngularJS 1.8, Live-Server, VS Code, Visual Studio 2019 Community edition


I hope this helps to run and see the output without any hassle.

Thanks
Jay


