import React  from 'react'
import {Route, Switch, MemoryRouter} from 'react-router'
import slave from './slave/containers/slave'
import master from './master/containers/master'
import login from './login/containers/login'
import overview from './overview/containers/overview'

class App extends React.Component {

    render() {
        return (
            <main>
                <MemoryRouter>
                    <Switch>
                        <Route exact path='/' component={login}/>
                        <Route path='/slave' component={slave}/>
                        <Route path='/master' component={master}/>
                        <Route path='/overview' component={overview}/>
                    </Switch>
                </MemoryRouter>
            </main>
        )
    }
}

export default App;
