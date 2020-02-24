(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{114:function(e,t,n){},118:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),i=n(49),s=n.n(i),r=n(5),l=n(6),c=n(8),h=n(7),u=n(9),m=n(11),d=n(17),f=n.n(d),O=n(50),g=n(51),p=n.n(g),v=function(e){function t(){var e;return Object(r.a)(this,t),(e=Object(c.a)(this,Object(h.a)(t).call(this))).slaveChannel=f()("/slaveChannel"),e.state={id:p.a.load("token")},e}return Object(u.a)(t,e),Object(l.a)(t,[{key:"componentDidMount",value:function(){var e=this;console.log("my state:  "+JSON.stringify(this.state)),this.slaveChannel.emit("slaveJoin",this.state),this.slaveChannel.on("setState",(function(t){console.log(JSON.stringify(t)),e.setState(t)}))}},{key:"render",value:function(){return o.a.createElement("div",null,o.a.createElement(O.Helmet,null,o.a.createElement("style",null,"body {background-color: ".concat(this.state.color,"; }"))),o.a.createElement("h1",null,"Thanks!"))}}]),t}(o.a.Component),y=n(3),S=n(52),w=n.n(S).a.create("penocw04.student.cs.kuleuven.be"),b=(n(114),function(e){function t(){var e;return Object(r.a)(this,t),(e=Object(c.a)(this,Object(h.a)(t).call(this))).send=e.send.bind(Object(y.a)(e)),e.no=e.no.bind(Object(y.a)(e)),e.yes=e.yes.bind(Object(y.a)(e)),e.getOS=e.getOS.bind(Object(y.a)(e)),e.state={OS:"",Browser:"",timeDiff:0,latency:0,timeDiffSocket:0,KULNetwork:!1,toEnd:!1,adjustedLatency:!1},e.loginChannel=f()("/loginChannel"),w.get("/login").then((function(e){})),e}return Object(u.a)(t,e),Object(l.a)(t,[{key:"getOS",value:function(){return this.OSName="",-1!==navigator.appVersion.indexOf("Mobile")?(-1!==navigator.appVersion.indexOf("iPhone")&&(this.OSName="IOS"),-1!==navigator.appVersion.indexOf("Android")&&(this.OSName="Android")):(-1!==navigator.appVersion.indexOf("X11")&&(this.OSName="UNIX"),-1!==navigator.appVersion.indexOf("Linux")&&(this.OSName="Linux"),-1!==navigator.appVersion.indexOf("Mac")&&(this.OSName="MacOS"),-1!==navigator.appVersion.indexOf("Win")&&(this.OSName="Windows")),this.OSName}},{key:"getBrowser",value:function(){return this.BrowserVersion="",-1!==navigator.appVersion.indexOf("Opera")?this.BrowserVersion="Opera":-1!==navigator.appVersion.indexOf("Edge")?this.BrowserVersion="Edge":-1!==navigator.appVersion.indexOf("Chrome")?this.BrowserVersion="Chrome":-1!==navigator.appVersion.indexOf("Safari")?this.BrowserVersion="Safari":-1!==navigator.appVersion.indexOf("FireFox")?this.BrowserVersion="FireFox":-1!==navigator.appVersion.indexOf("MSIE")?this.BrowserVersion="Internet Explorer":-1!==navigator.appCodeName.indexOf("Mozilla")&&(this.BrowserVersion="Firefox"),this.BrowserVersion}},{key:"componentDidMount",value:function(){var e=this;setInterval((function(){e.startTime=Date.now(),console.log("made this.startTime: "+e.startTime),e.loginChannel.emit("a")}),2e3),this.loginChannel.on("b",(function(){var t=Date.now();console.log("this.startTime: "+e.startTime),console.log("date.now: "+t),e.totalLatency=Date.now()-e.startTime,e.state.adjustedLatency?(console.log("in if from there"),console.log("this.state.latency: "+e.state.latency),console.log("this.totalLatency: "+e.totalLatency),console.log("formula in state: "+.5*e.state.latency+.5*e.totalLatency/2),e.setState({latency:.5*e.state.latency+.5*e.totalLatency/2})):(console.log("first time in else"),console.log("lateny gonna be: "+e.totalLatency/2),e.setState({latency:e.totalLatency/2,adjustedLatency:!0}))}));var t=this.getOS();console.log("OS: "+t),this.setState({OS:t});var n=this.getBrowser();console.log("browser: "+n),this.setState({Browser:n});var a=new XMLHttpRequest;a.open("GET","http://worldtimeapi.org/api/ip",!0),a.send(),a.onreadystatechange=function(){if(4===a.readyState&&200===a.status){var e=JSON.parse(a.responseText),t=new Date(e.datetime),n=(new Date-t)/1e3;console.log(n),this.setState({timeDiff:n})}}.bind(this),this.loginChannel.on("setState",(function(t){console.log(JSON.stringify(t)),e.setState(t)})),this.setState({OS:this.OSName}),this.setState({Browser:this.BrowserVersion})}},{key:"send",value:function(){this.loginChannel.emit("userData",{OS:this.state.OS,Browser:this.state.Browser,timeDiff:this.state.timeDiff,KULNetwork:this.state.KULNetwork,latency:this.state.latency,clientTime:(new Date).getTime()}),this.setState({toEnd:!0})}},{key:"yes",value:function(){this.setState({KULNetwork:!0})}},{key:"no",value:function(){this.setState({KULNetwork:!1})}},{key:"render",value:function(){return!0===this.state.toEnd?o.a.createElement(m.b,{to:"/slave"}):o.a.createElement("div",null,o.a.createElement("ul",null,o.a.createElement("li",null," ","Your OS: "+this.state.OS," "),o.a.createElement("li",null," ","Your browser: "+this.state.Browser," "),o.a.createElement("li",null," ","Your latency: "+this.state.latency," "),o.a.createElement("li",null,"  ","Time difference with socket: "+this.state.timeDiffSocket," "),o.a.createElement("li",null,"  ","Time difference with WTA: "+this.state.timeDiff," ")),o.a.createElement("div",null,o.a.createElement("h3",null,"Are you currently connected to the KUL network?"),o.a.createElement("button",{name:"yes",onClick:this.yes},"Yes"),o.a.createElement("button",{name:"no",onClick:this.no},"No")),o.a.createElement("div",null,o.a.createElement("h3",null,"Thank You"),o.a.createElement("button",{name:"send",onClick:this.send},"Send")))}}]),t}(o.a.Component)),E=function(e){function t(){return Object(r.a)(this,t),Object(c.a)(this,Object(h.a)(t).apply(this,arguments))}return Object(u.a)(t,e),Object(l.a)(t,[{key:"render",value:function(){return o.a.createElement("main",null,o.a.createElement(m.a,null,o.a.createElement(m.d,null,o.a.createElement(m.c,{exact:!0,path:"/",component:b}),o.a.createElement(m.c,{path:"/slave",component:v}))))}}]),t}(o.a.Component);n(117),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));s.a.render(o.a.createElement(E,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},55:function(e,t,n){e.exports=n(118)},88:function(e,t){}},[[55,1,2]]]);
//# sourceMappingURL=main.8b75ed5e.chunk.js.map