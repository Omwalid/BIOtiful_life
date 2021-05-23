import React, { Component } from "react";
import { Form, Button, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import axios from "axios";
import { styles } from "../styles/HomeFormStyle"
import { Row, Col } from 'react-bootstrap'
import bio from "../media/bio.jpg"
//import { styles } from "../styles/HomeComponentStyle"



class LogIn extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            error: ''

        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            [name]: value
        })

    }

    handleSubmit(event) {
        event.preventDefault();
        const user = {
            email: this.state.email,
            password: this.state.password
        }

        axios.post(`http://localhost:5000/users/login`, user, { withCredentials: true })
            .then(
                res => {
                    if (res.status === 200 && res.data.isLoggedIn === true) {
                        this.props.change_status(true, res.data.user)
                        //   window.location = "/user";
                    }
                }
            )
            .catch(e => {
                if (e.response && e.response.status === 401) {
                    this.setState({ error: e.response.data.message })
                    //    alert(e.response.data.message)
                }
                else console.log(e);
            })

    }

    render() {

        return (
            <Container style={{
                "margin" : "5px auto"}}>
                <Row>

                    <Col xs={12} md={6} >
                        <div style={Object.assign({}, styles.home, styles.loginHome)}>
                            <img style={styles.image} src={bio} alt="bio life"></img>
                        </div>
                    </Col>

                    <Col xs={12} md={6}>
                        <div style={styles.formDiv}>
                            <Form style={styles.form} onSubmit={this.handleSubmit}>
                                <p style={styles.error}>{this.state.error}</p>
                                <Form.Group controlId="formBasicEmail">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" name="email"
                                        value={this.state.email} onChange={this.handleInputChange} />
                                    <Form.Text className="text-muted">
                                        We'll never share your email with anyone else.
                                    </Form.Text>
                                </Form.Group>
                                <Form.Group controlId="formBasicPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" name="password"
                                        value={this.state.password} onChange={this.handleInputChange} />
                                </Form.Group>
                                <p>new to the platform
                                   <LinkContainer style={styles.link} to="/register">
                                        <a> register</a>
                                    </LinkContainer>
                                </p>
                                <Button style={styles.submit} type="submit">
                                    Submit
                                </Button>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>


        );
    }

}
export default LogIn;
