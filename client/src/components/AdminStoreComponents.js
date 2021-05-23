import React, { Component } from 'react'
import { Table,Pagination, Row, Col, Button, Modal, Form, Spinner } from 'react-bootstrap'
import axios from 'axios';
import { styles } from "../styles/AdminXComponents"
import { withRouter } from "react-router";


class AdminStore extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            productName: "",
            productType: '',
            unitOfMeasure: '',
            productQuantity: '',
            productPrice: '',
            productDescription: '',
            show: false,
            productToUpdate: 0,
            productImage: "",
            filterProductName: "",
            filterTypeOfProduct: "all",
            showUpdateModal: false,
            paginationNbr: 1,
            productPerPage: 2,
            filterdProducts: [],
            products: []
        }
        this.handleShow = this.handleShow.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.updateProduct = this.updateProduct.bind(this);
        this.imageHandler = this.imageHandler.bind(this);

    }

    async imageHandler(event) {
        const product_id = event.target.id
        const formData = new FormData();
        const file = event.target.files[0]
        if (file) {
            await formData.append("image", file);

            axios.post("http://localhost:5000/store/" + product_id + "/uploadfile", formData, {
                headers: { 'content-type': 'multipart/form-data' },withCredentials: true
            })
                .then(res => {
                    if (res.status === 201) {
                        window.location.reload(false);
                    }
                }
                ).catch((err) => {
                    const { history } = this.props;
                    if (err.response.status === 401 && err.response.data.message === "not logged_in") {
                        this.props.notLoggedIn(this.props.location)
                        return history.push('/login')
                    }
                    else if (err.response.status === 403) {
                        alert("you are not authorized")
                        return history.push('/')
                    } else alert(err.response.data.message)
                    console.log(err);
                })
        }
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

    filterProducts(event, productName, productType) {
        event.preventDefault();

        var productFiltered = this.state.products
        if (!productName == "") {
            productFiltered = productFiltered.filter(product => product.name === productName)
        }
        if (!(productType == "all")) {
            console.log(productType);

            productFiltered = productFiltered.filter(product => product.product_type === productType)

        }
        this.setState({ paginationNbr: 1 })
        this.setState({ filterdProducts: productFiltered })
        this.forceUpdate()
    }

    handleSubmit(event) {
        event.preventDefault();

        const newProduct = {
            productName: this.state.productName,
            productType: this.state.productType,
            unitOfMeasure: this.state.unitOfMeasure,
            productQuantity: this.state.productQuantity,
            productPrice: this.state.productPrice,
            productDescription: this.state.productDescription,
        }

        axios.post(`http://localhost:5000/store/addProduct`, newProduct, { withCredentials: true })
            .then(
                res => {
                    if (res.status === 201 && res.data.product_added === true) {
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
                else if (err.response.status === 409) { alert(err.response.data.message) }
                else if (err.response.status === 500) { alert("retry") }
                else if (err.response.status === 403) {
                    alert("you are not authorized")
                    return history.push('/')
                }
                console.log(err);

            })
    }

    updateProduct(event) {
        event.preventDefault();

        const producttoUpd = {
            productId: this.state.productToUpdate,
            productName: this.state.productName,
            productQuantity: this.state.productQuantity,
            productPrice: this.state.productPrice,
            productDescription: this.state.productDescription,
        }

        console.log(producttoUpd);

        axios.post(`http://localhost:5000/store/updateProduct`, producttoUpd, { withCredentials: true })
            .then(
                res => {
                    if (res.status === 200 && res.data.product_updated === true) {
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
                else if (err.response.status === 409) { alert("product already deleted or doesn't exist") }
                else if (err.response.status === 403) {
                    alert("you are not authorized")
                    return history.push('/')
                }
                console.log(err);

            })
    }
    deleteProduct(id, name) {

        axios.delete(`http://localhost:5000/store/deleteProduct/` + id + "&" + name, { withCredentials: true })
            .then(
                res => {
                    if (res.status === 200 && res.data.deleted === true) {
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
                else if (err.response.status === 409) { alert("product already deleted or doesn't exist") }
                else if (err.response.status === 403) {
                    alert("you are not authorized")
                    return history.push('/')
                }
                console.log(err);
            })
    }

    get_store() {
        axios.get('http://localhost:5000/store/getStock/all', { withCredentials: true })
            .then(res => {
                if (res.status === 200) {
                    this.setState({ isLoading: false })
                    this.setState({ products: res.data.stock })
                    this.setState({ filterdProducts: res.data.stock })

                }
            })
            .catch(err => {
                const { history } = this.props;
                if (err.response.status === 401 && err.response.data.message === "not logged_in") {
                    this.props.notLoggedIn(this.props.location)
                    return history.push('/login')
                }
                console.log(err);
                this.setState({ isLoading: false })

            })
    }
    componentDidMount() {
        this.get_store()
    }

    render() {
        var nb = (this.state.productPerPage*this.state.paginationNbr)-this.state.productPerPage;
        const productsTable = this.state.filterdProducts.
        slice((this.state.productPerPage*this.state.paginationNbr)-this.state.productPerPage,(this.state.productPerPage*this.state.paginationNbr)).map((product) => {
            nb += 1;
            return (
                <tr id={product.id} >
                    <td>{nb}</td>
                    <td>{product.name}</td>
                    <td>{product.product_type}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.unit_of_measure}</td>
                    <td>{product.description}</td>
                    <td>

                        <Form.Group >
                            <Form.Label>{product.image_name}</Form.Label>
                            <hr />
                            <Form.Control type="file" name="productImage" id={product.id} accept="image/*" multiple={false}
                                onChange={this.imageHandler} />
                        </Form.Group>
                    </td>
                    <td><Button variant="primary" style={styles.button}
                        onClick={() => {
                            this.setState({ productName: product.name });
                            this.setState({ unitOfMeasure: product.unit_of_measure });
                            this.setState({ productQuantity: product.quantity });
                            this.setState({ productPrice: product.price });
                            this.setState({ productDescription: product.description });
                            this.setState({ productToUpdate: product.id });
                            this.handleShow("showUpdateModal", true)
                        }}
                    >update</Button></td>
                    <td><Button variant="danger" style={styles.widthAll}
                        onClick={() => this.deleteProduct(product.id, product.name)}
                    >delete</Button></td>
                </tr>
            );
        });

        return (
            this.state.isLoading ? <Spinner animation="grow" /> :
                <div className="container" style={styles.spaceTop} >
                    <Form onSubmit={(event) => this.filterProducts(event, this.state.filterProductName, this.state.filterTypeOfProduct)}>
                        <Row>
                            <Col lg={4}>
                                <Form.Control placeholder="product name" onChange={this.handleInputChange}
                                    name="filterProductName" value={this.state.filterProductName
                                    } />
                            </Col>
                            <Col lg={4}>
                                <Form.Control as="select" name="filterTypeOfProduct" onChange={this.handleInputChange} >
                                    <option value="all">all</option>
                                    <option value="fruits">fruits</option>
                                    <option value="vegetables">vegetables</option>
                                    <option value="others">others</option>
                                </Form.Control>
                            </Col>
                            <Col lg={2}>
                                <Button variant="outline-primary" style={styles.widthAll} type="submit"
                                >filter</Button>
                            </Col>
                            <Col lg={2}>
                                <Button variant="outline-success" style={styles.widthAll} onClick={() => {
                                    this.setState({ filterProductName: "" });
                                    this.setState({ filterTypeOfProduct: "all" });
                                    this.setState({ filterdProducts: this.state.products });
                                    this.setState({ paginationNbr: 1 })
                                    this.forceUpdate()
                                }}
                                >reset</Button>
                            </Col>
                        </Row>
                    </Form>
                    <Table responsive="sm" striped bordered hover style={styles.spaceTop} >
                        <thead >
                            <tr >
                                <th>#</th>
                                <th>name</th>
                                <th>product type</th>
                                <th>price</th>
                                <th>quantity</th>
                                <th>unit of ms</th>
                                <th>description</th>
                                <th>Img</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody >
                            {productsTable}
                        </tbody>
                    </Table>
                    <Pagination>
                        <Pagination.Prev onClick={()=>{
                            if (!(this.state.paginationNbr === 1)){
                            this.setState({ paginationNbr : this.state.paginationNbr - 1 })
                            this.forceUpdate()}
                            }}/>
                        <Pagination.Next onClick={()=>{
                            if((this.state.paginationNbr*this.state.productPerPage) < this.state.filterdProducts.length)
                            {this.setState({ paginationNbr : this.state.paginationNbr + 1 })
                            this.forceUpdate()}
                        }}/>
                    </Pagination>
                    <div className="col-12 col-md-5 m-1">
                        <Button style={styles.button}
                            onClick={() => {
                                this.setState({ productName: "" });
                                this.setState({ unitOfMeasure: "" });
                                this.setState({ productQuantity: "" });
                                this.setState({ productPrice: "" });
                                this.setState({ productDescription: "" });
                                this.handleShow("show", true)
                            }}
                            className="m 2" variant="primary" size="lg">
                            add product
                </Button>
                    </div>


                    <Modal
                        show={this.state.show}
                        onHide={() => this.handleShow("show", false)}
                        dialogClassName="modal-90w"
                        aria-labelledby="example-custom-modal-styling-title"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="example-custom-modal-styling-title">
                                Product :
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            <Form onSubmit={this.handleSubmit}>

                                <Form.Group controlId="formBasicProductName">
                                    <Form.Label>name</Form.Label>
                                    <Form.Control type="text" name="productName" value={this.state.productName}
                                        onChange={this.handleInputChange} placeholder="Enter the product name" />
                                </Form.Group>
                                <br></br>

                                <Form.Group controlId="formProductType">
                                    <Form.Label>type of product</Form.Label>
                                    <Form.Control as="select" name="productType" onChange={this.handleInputChange} >
                                        <option value="fruits">fruits</option>
                                        <option value="vegetables">vegetables</option>
                                        <option value="others">others</option>
                                    </Form.Control>
                                </Form.Group>

                                <br></br>

                                <Form.Group controlId="formBasicUnitOfMeasure">
                                    <Form.Label>unit of measure</Form.Label>
                                    <Form.Control type="text" name="unitOfMeasure" value={this.state.unitOfMeasure}
                                        onChange={this.handleInputChange} placeholder="Enter unit of measure " />
                                </Form.Group>

                                <br></br>

                                <Form.Group controlId="formBasicProductQuantity">
                                    <Form.Label>product quantity </Form.Label>
                                    <Form.Control type="number" step="0.01" name="productQuantity" value={this.state.productQuantity}
                                        onChange={this.handleInputChange} placeholder="Enter the product quantity" />
                                </Form.Group>
                                <br></br>

                                <Form.Group controlId="formBasicProductPrice">
                                    <Form.Label>product price </Form.Label>
                                    <Form.Control type="number" step="0.01" name="productPrice" value={this.state.productPrice}
                                        onChange={this.handleInputChange} placeholder="Enter the product price" />
                                </Form.Group>
                                <br></br>

                                <Form.Group controlId="formBasicProductDescription">
                                    <Form.Label>product description</Form.Label>
                                    <Form.Control type="text" name="productDescription" value={this.state.productDescription}
                                        onChange={this.handleInputChange} placeholder="Enter product description " />
                                </Form.Group>

                                <hr></hr>

                                <Button type="submit" style={styles.button} >
                                    confirm product creation
                        </Button>
                            </Form>

                        </Modal.Body>
                        <Modal.Footer>
                            Biotiful life
                    </Modal.Footer>
                    </Modal>


                    <Modal
                        show={this.state.showUpdateModal}
                        onHide={() => this.handleShow("showUpdateModal", false)}
                        dialogClassName="modal-90w"
                        aria-labelledby="example-custom-modal-styling-title"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title id="example-custom-modal-styling-title">
                                Product : {this.state.productName}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>

                            <Form onSubmit={this.updateProduct}>
                                <Form.Group controlId="formBasicUnitOfMeasure" >
                                    <Form.Label>unit of measure</Form.Label>
                                    <Form.Control type="text" name="unitOfMeasure" disabled={true} value={this.state.unitOfMeasure}
                                        onChange={this.handleInputChange} placeholder="Enter unit of measure " />
                                </Form.Group>

                                <br></br>

                                <Form.Group controlId="formBasicProductQuantity">
                                    <Form.Label>product quantity </Form.Label>
                                    <Form.Control type="number" step="0.01" name="productQuantity" value={this.state.productQuantity}
                                        onChange={this.handleInputChange} placeholder="Enter the product quantity" />
                                </Form.Group>
                                <br></br>

                                <Form.Group controlId="formBasicProductPrice">
                                    <Form.Label>product price </Form.Label>
                                    <Form.Control type="number" step="0.01" name="productPrice" value={this.state.productPrice}
                                        onChange={this.handleInputChange} placeholder="Enter the product price" />
                                </Form.Group>
                                <br></br>

                                <Form.Group controlId="formBasicProductDescription">
                                    <Form.Label>product description</Form.Label>
                                    <Form.Control type="text" name="productDescription" value={this.state.productDescription}
                                        onChange={this.handleInputChange} placeholder="Enter product description " />
                                </Form.Group>
                                <hr></hr>

                                <Button type="submit" style={styles.button} >
                                    confirm product updates
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
export default withRouter(AdminStore);
