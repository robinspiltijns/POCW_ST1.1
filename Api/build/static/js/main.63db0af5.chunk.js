(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{114:function(e,t,n){},118:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),i=n(49),r=n.n(i),s=n(4),l=n(5),c=n(7),u=n(6),h=n(8),f=n(11),d=n(17),p=n.n(d),O=n(50),m=n(51),g=n.n(m),v=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(c.a)(this,Object(u.a)(t).call(this))).slaveChannel=p()("/slaveChannel"),e.state={id:g.a.load("token")},e}return Object(h.a)(t,e),Object(l.a)(t,[{key:"componentDidMount",value:function(){var e=this;console.log("my state:  "+JSON.stringify(this.state)),this.slaveChannel.emit("slaveJoin",this.state),this.slaveChannel.on("setState",(function(t){console.log(JSON.stringify(t)),e.setState(t)}))}},{key:"render",value:function(){return o.a.createElement("div",null,o.a.createElement(O.Helmet,null,o.a.createElement("style",null,"body {background-color: ".concat(this.state.color,"; }"))),o.a.createElement("h1",null,"Thanks! You can close this page now."))}}]),t}(o.a.Component),b=n(10),w=n(52),E=n.n(w).a.create("penocw04.student.cs.kuleuven.be"),k=(n(114),0),y=0,S=500,x=function(e){function t(){var e;return Object(s.a)(this,t),(e=Object(c.a)(this,Object(u.a)(t).call(this))).sendA=e.sendA.bind(Object(b.a)(e)),e.start=e.start.bind(Object(b.a)(e)),e.state={backgroundColor:"WHITE",offset:0,OS:"",Browser:"",latency:0,KULNetwork:!1,toEnd:!1,adjustedLatency:!1,chosen:!1},e.loginChannel=p()("/loginChannel"),E.get("/login").then((function(e){})),e}return Object(h.a)(t,e),Object(l.a)(t,[{key:"getOS",value:function(){return this.OSName="",-1!==navigator.appVersion.indexOf("Mobile")?(-1!==navigator.appVersion.indexOf("iPhone")&&(this.OSName="IOS"),-1!==navigator.appVersion.indexOf("Android")&&(this.OSName="Android")):(-1!==navigator.appVersion.indexOf("X11")&&(this.OSName="UNIX"),-1!==navigator.appVersion.indexOf("Linux")&&(this.OSName="Linux"),-1!==navigator.appVersion.indexOf("Mac")&&(this.OSName="MacOS"),-1!==navigator.appVersion.indexOf("Win")&&(this.OSName="Windows")),this.OSName}},{key:"getBrowser",value:function(){return this.BrowserVersion="",-1!==navigator.appVersion.indexOf("Opera")?this.BrowserVersion="Opera":-1!==navigator.appVersion.indexOf("Edge")?this.BrowserVersion="Edge":-1!==navigator.appVersion.indexOf("Chrome")?this.BrowserVersion="Chrome":-1!==navigator.appVersion.indexOf("Safari")?this.BrowserVersion="Safari":-1!==navigator.appVersion.indexOf("FireFox")?this.BrowserVersion="FireFox":-1!==navigator.appVersion.indexOf("MSIE")?this.BrowserVersion="Internet Explorer":-1!==navigator.appCodeName.indexOf("Mozilla")&&(this.BrowserVersion="Firefox"),this.BrowserVersion}},{key:"componentDidMount",value:function(){var e=this;this.offset=0,this.sendA(),this.loginChannel.on("b",(function(t){var n=Date.now();e.latency=(n-e.startTime)/2,e.currentOffset=n-t-e.latency,++k>10&&(e.offset=(y*e.offset+e.currentOffset)/(y+1),y++),e.setState({offset:e.offset}),S=20*e.latency})),this.loginChannel.on("go",(function(t){e.setState({backgroundColor:"GREEN"}),setTimeout((function(){e.setState({backgroundColor:"BLUE"})}),t-e.state.offset-Date.now()),console.log("date: "+t),console.log("offset: "+e.state.offset),console.log("now: "+Date.now()),console.log("total: "+t-e.state.offset-Date.now())}))}},{key:"sendA",value:function(){var e=this;setTimeout((function(){e.startTime=Date.now(),e.loginChannel.emit("a"),e.sendA()}),S)}},{key:"start",value:function(){this.loginChannel.emit("start")}},{key:"render",value:function(){return!0===this.state.toEnd?o.a.createElement(f.b,{to:"/slave"}):o.a.createElement("div",{style:{backgroundColor:this.state.backgroundColor,height:1e3}},o.a.createElement("div",null,this.state.offset),o.a.createElement("button",{onClick:this.start}," START "))}}]),t}(o.a.Component),C=function(e){function t(){return Object(s.a)(this,t),Object(c.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(h.a)(t,e),Object(l.a)(t,[{key:"render",value:function(){return o.a.createElement("main",null,o.a.createElement(f.a,null,o.a.createElement(f.d,null,o.a.createElement(f.c,{exact:!0,path:"/",component:x}),o.a.createElement(f.c,{path:"/slave",component:v}))))}}]),t}(o.a.Component);n(117),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(o.a.createElement(C,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},55:function(e,t,n){e.exports=n(118)},88:function(e,t){}},[[55,1,2]]]);
//# sourceMappingURL=main.63db0af5.chunk.js.map