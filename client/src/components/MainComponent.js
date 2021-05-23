import React, { Component } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom';
import Axios from "axios";
import { Spinner } from 'react-bootstrap'
import Home from './HomeComponent'
import NavBar from './NavBarComponents'
import LogIn from "./LoginComponent"
import Register from "./RegisterComponent"
import Store from "./StoreComponent"
import Product from "./ProductComponent"
import Orders from "./OrdersComponent"
import AdminStore from './AdminStoreComponents';
import AdminOrders from './AdminOrdersComponent';

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isLoggedIn: false,
            redirectPage: "/",
            selectedProduct: {},
            user: {}
        }
        this.change_status = this.change_status.bind(this);
        //   this.change_redirectPage = this.change_redirectPage.bind(this);

    }

    /*change_redirectPage(value) {
        this.setState({ redirectPage: value })
    }*/

    change_status(bol, ob, value) {
        this.setState({ isLoggedIn: bol, user: ob })
        this.setState({ redirectPage: value })

    }
    check_Login() {
        Axios.get('http://localhost:5000/users/logged_in', { withCredentials: true })
            .then(res => {
                if (res.data.isLoggedIn === true && this.state.isLoggedIn === false) {
                    this.change_status(true, res.data.user)
                }
                else if (!res.data.isLoggedIn && this.state.isLoggedIn) {
                    this.change_status(false, {})
                }
                this.setState({ isLoading: false })
            })
            .catch(err => {
                this.setState({ isLoading: false })
                // console.log(err.response.data.message);
            })
    }

    componentDidMount() {
        this.check_Login();
    }
    render() {
        return (
            <div >
                {this.state.isLoading ? <Spinner animation="grow" /> :
                    <div>
                        <NavBar isLoggedIn={this.state.isLoggedIn} userRole={this.state.user.role_id} change_status={this.change_status} />
                        <Switch>
                            <Route exact path="/"><Home /></Route>

                            <Route path="/register">{this.state.isLoggedIn ? <Redirect to={this.state.redirectPage} />
                                : <Register change_status={this.change_status} isLoggedIn={this.state.isLoggedIn} />}</Route>

                            <Route path="/login">{this.state.isLoggedIn ? <Redirect to={this.state.redirectPage} />
                                : <LogIn change_status={this.change_status} isLoggedIn={this.state.isLoggedIn} />}</Route>

                            <Route path="/store/:kind"><Store /></Route>
                            
                            <Route exact path="/admin/store">
                                {(this.state.isLoggedIn && this.state.user.role_id === 1) 
                                ? <AdminStore notLoggedIn={(path) => { this.change_status(false, {}, path) }} />
                                : <Redirect to="/" />
                                 }
                                
                            </Route>
                            <Route exact path="/admin/orders">
                            {(this.state.isLoggedIn && this.state.user.role_id === 1) 
                                ? <AdminOrders notLoggedIn={(path) => { this.change_status(false, {}, path) }} /> 
                                : <Redirect to="/" />
                                 }
                                
                            </Route>


                            <Route  path="/product/:id">
                                <Product
                                    notLoggedIn={(path) => { this.change_status(false, {}, path) }}
                                    isLoggedIn={this.state.isLoggedIn} />
                            </Route>

                            <Route  path="/orders">
                                {!this.state.isLoggedIn ? <Redirect to="/login" />
                                    : <Orders notLoggedIn={(path) => { this.change_status(false, {}, path) }} />}</Route>

                            <Redirect to="/" />
                        </Switch>
                    </div>
                }
            </div>

        );
    }
}

export default Main;
//change_redirectPage={this.change_redirectPage}