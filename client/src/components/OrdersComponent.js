import React, { Component } from "react";
import { Alert, Container,Pagination, Spinner, Row, Col, Card, ListGroup, ListGroupItem } from 'react-bootstrap'
import axios from "axios";
import home_bio from "../media/home_bio.jpg"
import { styles } from "../styles/OrdersComponentStyle"
import { withRouter } from "react-router";
import { paginationStyle } from "../styles/Pagination"

class Orders extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            pageNotFound: false,
            imgUrl: "http://localhost:5000/productImage/",
            paginationNbr: 1,
            productPerPage: 3,
            orders: []
        }
    }



    get_orders() {
        axios.get('http://localhost:5000/orders/getUserOrders/', { withCredentials: true })
            .then(res => {

                if (res.status === 200) {
                    this.setState({ orders: res.data.orders })
                    this.setState({ isLoading: false })
                }
            })
            .catch(err => {
                const { history } = this.props;
                if (err.response.status === 401 && err.response.data.message === "not logged_in") {
                    this.props.notLoggedIn(this.props.location)
                    return history.push('/login')
                }
                else
                    console.log(err);
            })
    }

    componentDidMount() {
        this.get_orders();
    }

    render() {
        const title =  (this.state.orders.length === 0) ? <h1></h1> :
                   <h1 style={styles.header1}>Order List</h1>

        const orders = (this.state.orders.length === 0) ?
            <Container fluid style={styles.divAlert}>
                <Alert variant="light">
                    <Alert.Heading>No order</Alert.Heading>
                    <p>
                        You have no order yet
                    </p>
                    <hr />
                    <p className="mb-0">
                        Go to store, and make an order, it's easy
                    </p>
                </Alert>
            </Container>
            : 
            this.state.orders.
            slice((this.state.productPerPage*this.state.paginationNbr)-this.state.productPerPage,(this.state.productPerPage*this.state.paginationNbr)).map((order) => {
                return (
                    <Container fluid style={styles.divContainer}>
                        <Card className="bg-white text-white" style={styles.cards}>
                            <Row>
                                <Col xs={6} sm={3} lg={3}>
                                    <Card.Img src={`${this.state.imgUrl}${order.image_path}`} style={styles.images} alt="Card image" />
                                </Col>
                                <Col xs={6} sm={9} lg={9}>
                                    <Card.Body style={styles.cardsBody}>
                                        <ListGroup className="list-group-flush">
                                            <ListGroupItem >{order.product_name}</ListGroupItem>
                                            <ListGroupItem >{order.quantity} {order.unit_of_measure}</ListGroupItem>
                                            <ListGroupItem >
                                                {order.cost} DZ
                                        </ListGroupItem >
                                        </ListGroup>
                                    </Card.Body>
                                    <Card.Footer>
                                        <small className="text-muted">status : {order.order_status}</small>
                                    </Card.Footer>
                                </Col>
                            </Row>
                        </Card>
                    </Container>
                )
            })

        return (
            <div>
                 {title}
                 {orders}
                 <Pagination style={paginationStyle.main}>
                        <Pagination.Prev onClick={()=>{
                            if (!(this.state.paginationNbr === 1)){
                            this.setState({ paginationNbr : this.state.paginationNbr - 1 })
                            this.forceUpdate()}
                            }}/>
                        <Pagination.Next onClick={()=>{
                            if((this.state.paginationNbr*this.state.productPerPage) < this.state.orders.length)
                            {this.setState({ paginationNbr : this.state.paginationNbr + 1 })
                            this.forceUpdate()}
                        }}/>
                    </Pagination>
            </div>
        );
    }
}
export default withRouter(Orders);