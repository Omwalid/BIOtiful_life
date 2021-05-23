import React, { Component } from 'react'
import { Table,Row,Pagination, Col, Button, Modal, Form, Spinner } from 'react-bootstrap'
import axios from 'axios';
import { styles } from "../styles/AdminXComponents"
import { withRouter } from "react-router";


class AdminOrders extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            productName: "",
            productType: '',
            unitOfMeasure : '',
            productQuantity: '',
            productPrice: '',
            orderStatus: 1,
            show: false,
            orderToUpdate: 0,
            filterUserName: "",
            filterDeliveryStatus: "all",
            showUpdateModal: false,
            paginationNbr: 1,
            productPerPage: 2,
            filterdOrders: [],
            orders: []
        }
        this.handleShow = this.handleShow.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.updateProduct = this.updateProduct.bind(this);


    }


    handleShow(state, bool) {
        this.setState({ [state]: bool })
    }

    filterOrders(event,userName,deliveryStatus){
        event.preventDefault();

        var ordersFiltered = this.state.orders
      if (!userName == ""){ 
      ordersFiltered = ordersFiltered.filter(order=> order.userName === userName)
    }
      if (!(deliveryStatus == "all")){
        ordersFiltered = ordersFiltered.filter(order=> order.order_status === deliveryStatus)
    }
      this.setState({ filterdOrders: ordersFiltered })
      this.setState({ paginationNbr: 1 })
      this.forceUpdate()    
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }


    updateProduct(event) {
        event.preventDefault();

        const producttoUpd = {
            ordertId: this.state.orderToUpdate,
            orderStatusId: this.state.orderStatus
        }

        console.log(producttoUpd);

        axios.post(`http://localhost:5000/orders/updateOrder`, producttoUpd, { withCredentials: true })
            .then(
                res => {
                    if (res.status === 200 && res.data.order_updated === true) {
                        this.handleShow("show", false);
                        window.location.reload(false);
                        
                    }
                }
            )
            .catch(err => {
                const { history } = this.props;
                if (err.response.status === 401 && err.response.data.message === "not logged_in") {
                    this.props.notLoggedIn(this.props.location)
                    return history.push('/login')
                }
                else if (err.response.status === 409) { alert("order doesn't exist") }
                else if (err.response.status === 403) {
                    alert("you are not authorized")
                    return history.push('/')
                }
                console.log(err);

            })
    }


    get_orders() {
        axios.get('http://localhost:5000/orders/getAllOrders', { withCredentials: true })
            .then(res => {
                if (res.status === 200) {
                    this.setState({ isLoading: false })
                    this.setState({ orders: res.data.orders })
                    this.setState({ filterdOrders: res.data.orders })

                }
            })
            .catch(err => {
                this.setState({ isLoading: false })
                const { history } = this.props;
                if (err.response.status === 401 && err.response.data.message === "not logged_in") {
                    this.props.notLoggedIn(this.props.location)
                    return history.push('/login')
                }
                else if (err.response.status === 403) {
                    alert("you are not authorized")
                    return history.push('/')
                }
                console.log(err);

            })
    }
    componentDidMount() {
        this.get_orders()
    }

    render() {
        var nb = (this.state.productPerPage*this.state.paginationNbr)-this.state.productPerPage;
        const ordersTable = this.state.filterdOrders.
        slice((this.state.productPerPage*this.state.paginationNbr)-this.state.productPerPage,(this.state.productPerPage*this.state.paginationNbr)).map((order) => {
            nb += 1;
            return (
                <tr id={order.id} >
                    <td>{nb}</td>
                    <td>{order.userName}</td>
                    <td>{order.name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.unit_of_measure}</td>
                    <td>{order.cost}</td>
                    <td>{order.address}</td>
                    <td>0{order.phone_number}</td>
                    <td>{order.order_status}</td>

                    <td><Button variant="primary" style={styles.button}
                        onClick={() => {
                            this.setState({orderToUpdate : order.id});
                            this.handleShow("showUpdateModal", true)}}
                    >update</Button></td>
                </tr>
            );
        });

        return (
            this.state.isLoading ? <Spinner animation="grow" /> :
                <div className="container" style={styles.spaceTop}>
                    <Form onSubmit={(event)=> this.filterOrders(event, this.state.filterUserName, this.state.filterDeliveryStatus)}>
                        <Row>
                            <Col lg={4}>
                                <Form.Control placeholder="user name"  onChange={this.handleInputChange}
                                name="filterUserName" value={this.state.filterUserName
                                }/>
                            </Col>
                            <Col lg={4}>
                            <Form.Control as="select" name="filterDeliveryStatus" onChange={this.handleInputChange} >
                                    <option value="all">all</option>
                                    <option value="not yet">not yet</option>
                                    <option value="in progress">in progress</option>
                                    <option value="delivered">delivered</option>
                            </Form.Control>                            
                            </Col>
                            <Col lg={2}>
                            <Button variant="outline-primary" style={styles.widthAll} type="submit"
                            >filter</Button>
                            </Col>
                            <Col lg={2}>
                            <Button variant="outline-success" style={styles.widthAll} onClick={()=>{
                                this.setState({ filterUserName: "" });
                                this.setState({ filterDeliveryStatus: "all" });
                                this.setState({ filterdOrders : this.state.orders});
                                this.setState({ paginationNbr: 1 })
                                this.forceUpdate()    
                            }}
                            >reset</Button>
                            </Col>
                        </Row>
                    </Form>

                    <Table responsive="sm" striped bordered hover style={styles.spaceTop}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>user name</th>
                                <th>product</th>
                                <th>quantity</th>
                                <th>unit of ms</th>
                                <th>cost</th>
                                <th>address</th>
                                <th>phone number</th>
                                <th>order status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {ordersTable}
                        </tbody>
                    </Table>
                    <Pagination >
                        <Pagination.Prev onClick={()=>{
                            if (!(this.state.paginationNbr === 1)){
                            this.setState({ paginationNbr : this.state.paginationNbr - 1 })
                            this.forceUpdate()}
                            }}/>
                        <Pagination.Next onClick={()=>{
                            if((this.state.paginationNbr*this.state.productPerPage) < this.state.filterdOrders.length)
                            {this.setState({ paginationNbr : this.state.paginationNbr + 1 })
                            this.forceUpdate()}
                        }}/>
                    </Pagination>
                    <Modal
                        show={this.state.showUpdateModal}
                        onHide={() => this.handleShow("showUpdateModal", false)}
                        dialogClassName="modal-90w"
                        aria-labelledby="example-custom-modal-styling-title"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="example-custom-modal-styling-title">
                                Order : {this.state.orderToUpdate}
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            <Form onSubmit={this.updateProduct}>
                               
                            <Form.Group controlId="formOrderStatus">
                                    <Form.Label>Order status</Form.Label>
                                    <Form.Control as="select" name="orderStatus" onChange={this.handleInputChange} >
                                        <option value="1">not yet</option>
                                        <option value="2">in progress</option>
                                        <option value="3">delivered</option>
                                    </Form.Control>
                                </Form.Group>
                                <hr></hr>

                                <Button type="submit" style={styles.button} >
                                    confirm order update 
                        </Button>
                            </Form>

                        </Modal.Body>
                        <Modal.Footer>
                            Biotiful life
                    </Modal.Footer>
                    </Modal>

                </div>

        );
    }
}
export default withRouter(AdminOrders);
