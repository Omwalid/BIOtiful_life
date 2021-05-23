import React, { Component } from "react";
import home_bio from "../media/home_bio.jpg"
import { styles } from "../styles/HomeComponentStyle"
import { Container } from 'react-bootstrap'

class Home extends Component {


    render() {

        return (
            <Container style={styles.home}>
                <img style={styles.image} src={home_bio} alt="bio life"></img> 
           </Container>
        );
    }
}

export default Home;
