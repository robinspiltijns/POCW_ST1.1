(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{114:function(e,n,t){},118:function(e,n,t){"use strict";t.r(n);var a=t(0),o=t.n(a),i=t(49),r=t.n(i),s=t(4),c=t(5),l=t(7),f=t(6),u=t(8),h=t(10),d=t(17),p=t.n(d),O=t(50),v=t(51),m=t.n(v),g=function(e){function n(){var e;return Object(s.a)(this,n),(e=Object(l.a)(this,Object(f.a)(n).call(this))).slaveChannel=p()("/slaveChannel"),e.state={id:m.a.load("token")},e}return Object(u.a)(n,e),Object(c.a)(n,[{key:"componentDidMount",value:function(){var e=this;console.log("my state:  "+JSON.stringify(this.state)),this.slaveChannel.emit("slaveJoin",this.state),this.slaveChannel.on("setState",(function(n){console.log(JSON.stringify(n)),e.setState(n)}))}},{key:"render",value:function(){return o.a.createElement("div",null,o.a.createElement(O.Helmet,null,o.a.createElement("style",null,"body {background-color: ".concat(this.state.color,"; }"))),o.a.createElement("h1",null,"Thanks! You can close this page now."))}}]),n}(o.a.Component),w=t(16),b=t(52),y=t.n(b).a.create("penocw04.student.cs.kuleuven.be"),x=(t(114),0),V=0,S=500,E=function(e){function n(){var e;return Object(s.a)(this,n),(e=Object(l.a)(this,Object(f.a)(n).call(this))).sendA=e.sendA.bind(Object(w.a)(e)),e.state={offset:0,OS:"",Browser:"",latency:0,KULNetwork:!1,toEnd:!1,adjustedLatency:!1,chosen:!1},e.loginChannel=p()("/loginChannel"),y.get("/login").then((function(e){})),e}return Object(u.a)(n,e),Object(c.a)(n,[{key:"getOS",value:function(){return this.OSName="",-1!==navigator.appVersion.indexOf("Mobile")?(-1!==navigator.appVersion.indexOf("iPhone")&&(this.OSName="IOS"),-1!==navigator.appVersion.indexOf("Android")&&(this.OSName="Android")):(-1!==navigator.appVersion.indexOf("X11")&&(this.OSName="UNIX"),-1!==navigator.appVersion.indexOf("Linux")&&(this.OSName="Linux"),-1!==navigator.appVersion.indexOf("Mac")&&(this.OSName="MacOS"),-1!==navigator.appVersion.indexOf("Win")&&(this.OSName="Windows")),this.OSName}},{key:"getBrowser",value:function(){return this.BrowserVersion="",-1!==navigator.appVersion.indexOf("Opera")?this.BrowserVersion="Opera":-1!==navigator.appVersion.indexOf("Edge")?this.BrowserVersion="Edge":-1!==navigator.appVersion.indexOf("Chrome")?this.BrowserVersion="Chrome":-1!==navigator.appVersion.indexOf("Safari")?this.BrowserVersion="Safari":-1!==navigator.appVersion.indexOf("FireFox")?this.BrowserVersion="FireFox":-1!==navigator.appVersion.indexOf("MSIE")?this.BrowserVersion="Internet Explorer":-1!==navigator.appCodeName.indexOf("Mozilla")&&(this.BrowserVersion="Firefox"),this.BrowserVersion}},{key:"componentDidMount",value:function(){var e=this;this.offset=0,this.sendA(),this.loginChannel.on("b",(function(n){var t=Date.now();e.latency=(t-e.startTime)/2,e.currentOffset=t-n-e.latency,console.log("latency: "+e.latency),console.log("latest offset: "+e.currentOffset),++x>10?(console.log("growing factor in avg: "+V*e.offset),e.offset=(V*e.offset+e.currentOffset)/(V+1),console.log("latest average: "+e.offset),V++):console.log("in initial checks"),e.setState({offset:e.offset}),S=20*e.latency}))}},{key:"sendA",value:function(){var e=this;setTimeout((function(){e.startTime=Date.now(),e.loginChannel.emit("a"),e.sendA()}),S)}},{key:"render",value:function(){return!0===this.state.toEnd?o.a.createElement(h.b,{to:"/slave"}):o.a.createElement("div",null,this.state.offset)}}]),n}(o.a.Component),k=function(e){function n(){return Object(s.a)(this,n),Object(l.a)(this,Object(f.a)(n).apply(this,arguments))}return Object(u.a)(n,e),Object(c.a)(n,[{key:"render",value:function(){return o.a.createElement("main",null,o.a.createElement(h.a,null,o.a.createElement(h.d,null,o.a.createElement(h.c,{exact:!0,path:"/",component:E}),o.a.createElement(h.c,{path:"/slave",component:g}))))}}]),n}(o.a.Component);t(117),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(o.a.createElement(k,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},55:function(e,n,t){e.exports=t(118)},88:function(e,n){}},[[55,1,2]]]);
//# sourceMappingURL=main.873ef809.chunk.js.map