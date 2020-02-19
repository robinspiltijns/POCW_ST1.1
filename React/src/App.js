import React  from 'react'
import {Route, Switch, MemoryRouter} from 'react-router'
import slave from './slave/containers/slave'
import login from './login/containers/login'


class App extends React.Component {

    render() {
        return (
            <main>
                <MemoryRouter>
                    <Switch>
                        <Route exact path='/' component={login}/>
                        <Route path='/slave' component={slave}/>
                    </Switch>
                </MemoryRouter>
            </main>
        )
    }
}

export default App;
