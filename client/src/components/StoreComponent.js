import React, { Component } from "react";
import { Container, Pagination, Alert, Button, Spinner, Row, Col, Card, ListGroup, ListGroupItem } from 'react-bootstrap'
import axios from "axios";
import { withRouter } from "react-router";
import { paginationStyle } from "../styles/Pagination"

class Store extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            imgUrl: "http://localhost:5000/productImage/",
            pageNotFound: false,
            paginationNbr: 1,
            productPerPage: 3,
            products: []
        }
        this.change_status = this.change_status.bind(this);
    }


    change_status(bol, ob) {
        this.setState({ isLoggedIn: bol, user: ob })

    }
    get_products() {
        const { params } = this.props.match;
        axios.get('http://localhost:5000/store/getStock/' + params.kind, { withCredentials: true })
            .then(res => {
                if (res.status === 200) {
                    this.setState({ products: res.data.stock })
                    this.setState({ isLoading: false })
                }
            })
            .catch(err => {
                if (err.response.status === 404) {
                    this.setState({ pageNotFound: true })
                    this.setState({ isLoading: false })
                }
                else console.log(err);
            })
    }

    componentDidMount() {
        this.get_products();
    }

    render() {
        const products =
            this.state.pageNotFound ?

                <Alert variant="danger">
                    <Alert.Heading>type of product </Alert.Heading>
                    <p>
                        The type of product doesn't exist!
                    </p>
                    <hr />
                    <div className="d-flex justify-content-end">
                    </div>
                </Alert>
                :
                this.state.products.
                    slice((this.state.productPerPage * this.state.paginationNbr) - this.state.productPerPage, (this.state.productPerPage * this.state.paginationNbr)).map((product) => {
                        return (

                            <Col xs={12} sm={6} lg={4} key={product.id}>
                                <Card >
                                    <Card.Img variant="top" style={{ "height": "300px" }}
                                        src={`${this.state.imgUrl}${product.image_path}`} alt={product.name} />
                                    <Card.Body>
                                        <Card.Title>{product.name}</Card.Title>
                                        <Card.Text>
                                            {product.description}
                                        </Card.Text>
                                    </Card.Body>
                                    <ListGroup className="list-group-flush">
                                        <ListGroupItem>{product.product_type}</ListGroupItem>
                                        <ListGroupItem>{product.price} DZ / {product.unit_of_measure}</ListGroupItem>
                                        <ListGroupItem>
                                            {!(product.quantity === 0) ? "disponible" : "sold out"}
                                        </ListGroupItem>
                                    </ListGroup>
                                    <Card.Body>
                                    <Button type="submit" variant="outline-success" 
                                    href={`/product/${product.id}`} style={paginationStyle.widthAll} >View</Button>
                                    </Card.Body>
                                </Card>
                            </Col>

                        )
                    })

        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner animation="grow" />
                    :
                    <Container fluid >
                        <Row style={{ "margin": "5px" }}>
                            {products}
                        </Row>
                        <Pagination style={paginationStyle.main}>
                            <Pagination.Prev onClick={() => {
                                if (!(this.state.paginationNbr === 1)) {
                                    this.setState({ paginationNbr: this.state.paginationNbr - 1 })
                                    this.forceUpdate()
                                }
                            }} />
                            <Pagination.Next onClick={() => {
                                if ((this.state.paginationNbr * this.state.productPerPage) < this.state.products.length) {
                                    this.setState({ paginationNbr: this.state.paginationNbr + 1 })
                                    this.forceUpdate()
                                }
                            }} />
                        </Pagination>
                    </Container>
                }
            </React.Fragment>

        );
    }
}
export default withRouter(Store);

//<Card.Link href={`/product/${product.id}`} >view</Card.Link>
