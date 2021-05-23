import React, { Component } from 'react'
import { Navbar, Nav, Button, NavDropdown } from 'react-bootstrap'
import axios from "axios";

class NavBar extends Component {

    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }

    logout() {
        axios.get(`http://localhost:5000/users/logout`, { withCredentials: true })
            .then(
                async res => {
                    if (res.status === 200 && res.data.loggedOut === true) {
                        this.props.change_status(false, {})
                        console.log('logged-out')
                    }
                    else { console.log("user still logged-in") }
                }
            )
            .catch(e => { console.log(e) })
    }


    render() {
        return (
             <Navbar collapseOnSelect expand="lg" style={{"backgroundColor":"#556B2F", "padding":"10px"}}  >
                    <Navbar.Brand href="/">Biotiful life</Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    {(this.props.userRole === 1) 
                            ? 
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                            <Nav.Link href="/admin/store">Store</Nav.Link>
                            <Nav.Link href="/admin/orders">Orders</Nav.Link>
                            </Nav>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
                            <Button variant="dark" onClick={this.logout} >logout</Button>

                        </Navbar.Collapse>
                            :
                    <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto">
                            <Nav.Link href="/">Home</Nav.Link>
                            {this.props.isLoggedIn ?
                            <Nav.Link href="/orders">Orders</Nav.Link> : <span></span>}
                            <NavDropdown title="Store" id="collasible-nav-dropdown">
                                <NavDropdown.Item href="/store/fruits">fruits</NavDropdown.Item>
                                <NavDropdown.Item href="/store/vegetables">vegetables</NavDropdown.Item>
                                <NavDropdown.Item href="/store/others">others</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/store/all">All</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>
                        {this.props.isLoggedIn ? <Button variant="dark" onClick={this.logout} >logout</Button>:
                            <Nav>
                                <Nav.Link href="/login">login</Nav.Link>
                                <Nav.Link eventKey={2} href="/register">register</Nav.Link>
                            </Nav>
                        }        
                    
                    </Navbar.Collapse>
    }
                </Navbar>
           
           );
    }
}

export default NavBar;

/*

*/
// bg="dark" variant="dark"