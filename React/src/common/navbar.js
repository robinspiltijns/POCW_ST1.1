import React from 'react'
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { Link } from 'react-router-dom'
import './navbar.css'
import { NavLink as RRNavLink } from 'react-router-dom';


class NavigateBar extends React.Component {

    constructor() {
        super();
        this.state = {
            collapsed: true
        };
        this.toggleNavbar = this.toggleNavbar.bind(this);
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    render() {
        return (
            <div>
                <Navbar expand="md" color="dark" dark >
                    <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                    <NavbarBrand  href="/" className="ml-auto d-none d-sm-block">Multicast</NavbarBrand>
                    <Collapse isOpen={!this.state.collapsed} navbar>
                        <Nav navbar>
                            <NavItem>
                                <Link tag={RRNavLink} className="link" to="/"  >Slave</Link>
                            </NavItem>
                            <NavItem>
                                <Link tag={RRNavLink} className="link registration" to="/master" >Master</Link>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        )
    }
}

export default NavigateBar;
