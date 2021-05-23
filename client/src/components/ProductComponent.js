import React, { Component } from "react";
import { Alert, Container, Spinner, Row, Modal, Form, Button, Col, Card, ListGroup, ListGroupItem } from 'react-bootstrap'
import axios from "axios";
import { withRouter } from "react-router";
import { styles } from "../styles/ProductComponentStyle"


class Product extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            pageNotFound: false,
            orderQuantity: 0,
            userAddress: '',
            typeOfDelivery: 1,
            showModal: false,
            imgUrl: "http://localhost:5000/productImage/",
            product: []
        }
        this.handleShow = this.handleShow.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleShow(state, bool) {
        this.setState({ [state]: bool })
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        var userAddress = (this.state.typeOfDelivery == 1) ? "local" : this.state.userAddress
        const newOrder = {
            productId: this.state.product.id,
            orderQuantity: this.state.orderQuantity,
            userAddress: userAddress,
        }

        axios.post(`http://localhost:5000/orders/addOrder`, newOrder, { withCredentials: true })
            .then(
                res => {
                    if (res.status === 201 && res.data.order_added === true) {
                        this.handleShow("show", false);
                        return this.props.history.push('/orders')
                    }
                }
            )
            .catch(err => {
                const { history } = this.props;
                if (err.response.status === 401 && err.response.data.message === "not logged_in") {
                    this.props.notLoggedIn(this.props.location)
                    return history.push('/login')
                }
                else if (err.response.status === 403) { alert(err.response.data.message) }
                else if (err.response.status === 409) { alert(err.response.data.message) }
                else if (err.response.status === 500) { alert("retry") }
                else console.log(err);

            })
    }


    componentDidMount() {
        const { params } = this.props.match;
        axios.get('http://localhost:5000/store/getProduct/' + params.id, { withCredentials: true })
            .then(res => {
                if (res.status === 200) {
                    this.setState({ product: res.data.product })
                    this.setState({ isLoading: false })
                }
            })
            .catch(err => {
                if (err.response.status === 404) {
                    this.setState({ pageNotFound: true })
                    this.setState({ isLoading: false })
                }
                console.log(err);
                this.setState({ isLoading: false })

            })
    }

    render() {
        const product =
            this.state.pageNotFound ?

                <Alert variant="danger">
                    <Alert.Heading>No product </Alert.Heading>
                    <p>
                        The product doesn't exist!
                    </p>
                    <hr />
                    <div className="d-flex justify-content-end">
                    </div>
                </Alert>
                :
                <Row style={styles.productRow}>
                    <Col xs={12} sm={6} lg={6} style={styles.imgDiv} >
                        <img style={styles.images} src={`${this.state.imgUrl}${this.state.product.image_path}`} alt="bio life"></img>
                    </Col>
                    <Col xs={12} sm={6} lg={6} >
                        <Card >
                            <Card.Body>
                                <Card.Title>{this.state.product.name}</Card.Title>
                                <Card.Text>
                                    {this.state.product.description}
                                </Card.Text>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                                <ListGroupItem>{this.state.product.product_type}</ListGroupItem>
                                <ListGroupItem>{this.state.product.price} DZ / {this.state.product.unit_of_measure}</ListGroupItem>
                                <ListGroupItem>
                                    {!(this.state.product.quantity === 0) ? "disponible" : "sold out"}
                                </ListGroupItem>
                            </ListGroup>
                            <Card.Body>
                                <Button style={styles.button}
                                    onClick={() => {
                                        if (!this.props.isLoggedIn) {
                                            this.props.notLoggedIn(this.props.location)
                                            return this.props.history.push('/login')
                                        }
                                        else this.handleShow("show", true)

                                    }}>Order</Button>
                            </Card.Body>
                        </Card>

                    </Col>
                </Row>

        return (
            <Container fluid >
                {product}
                <Modal
                    show={this.state.show}
                    onHide={() => this.handleShow("show", false)}
                    dialogClassName="modal-90w"
                    aria-labelledby="example-custom-modal-styling-title"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-custom-modal-styling-title">
                            Order : {this.state.product.name}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={this.handleSubmit}>

                            <Form.Group controlId="formBasicOrderQuantity">
                                <Form.Label>quantity</Form.Label>
                                <Form.Control type="number" step="0.01" name="orderQuantity" value={this.state.orderQuantity}
                                    onChange={this.handleInputChange} placeholder="Enter the quantity" />
                            </Form.Group>
                            <br></br>

                            <Form.Group controlId="formTypeofDelivery">
                                <Form.Label>type of delivery</Form.Label>
                                <Form.Control as="select" name="typeOfDelivery" onChange={this.handleInputChange} >
                                    <option value="1">get the product from local</option>
                                    <option value="2">delivery</option>
                                </Form.Control>
                            </Form.Group>
                            <br></br>

                            {(this.state.typeOfDelivery == 1) ? <div></div>
                                :
                                <Form.Group controlId="formBasicUserAddress">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control type="text" name="userAddress" value={this.state.userAddress}
                                        onChange={this.handleInputChange} placeholder="Enter your address " />
                                </Form.Group>

                            }
                            
                            <hr></hr>

                            <Button type="submit" style={styles.button} >
                                confirm order
                        </Button>
                        </Form>

                    </Modal.Body>
                    <Modal.Footer>

                        {this.state.product.price * this.state.orderQuantity} DZ
                    </Modal.Footer>
                </Modal>

            </Container>


        );
    }
}
export default withRouter(Product);