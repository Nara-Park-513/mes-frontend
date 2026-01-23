import {Container,Row,Col,Card,Button,Form} from 'react-bootstrap';

const Home = () => {
    return(
        <>
           <Container>

        {/*} Outer Row*/}
        <Row className="justify-content-center">

            <Col className="col-xl-10 col-lg-12 col-md-9">

                <Card className="card o-hidden border-0 shadow-lg my-5">
                    <Card.Body className="p-0">
                        {/*} Nested Row within Card Body*/}
                        <Row>
                            <Col className="col-lg-6 d-none d-lg-block bg-login-image"></Col>
                            <Col className="col-lg-6">
                                <div className="p-5">
                                    <div className="text-center">
                                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                                    </div>
                                    <form className="user">
                                        <div className="form-group">
                                            <Form.Control className="form-control-user"
                                                id="exampleInputEmail" aria-describedby="emailHelp"
                                                placeholder="Enter Email Address..."/>
                                        </div>
                                        <div className="form-group">
                                            <Form.Control type="password" className="form-control-user"
                                                id="exampleInputPassword" placeholder="Password"/>
                                        </div>
                                        <div className="form-group">
                                            <div className="custom-control custom-checkbox small">
                                                <input type="checkbox" className="custom-control-input" id="customCheck"/>
                                                <label className="custom-control-label" htmlFor="customCheck">Remember
                                                    Me</label>
                                            </div>
                                        </div>
                                        <Button className="btn-user btn-block" variant='primary'>
                                            Login
                                        </Button>


                                        <hr/>
                                        <a href="" className="btn btn-google btn-user btn-block">
                                            <i className="fab fa-google fa-fw"></i> Login with Google
                                        </a>
                                        <a href="" className="btn btn-facebook btn-user btn-block">
                                            <i className="fab fa-facebook-f fa-fw"></i> Login with Insta
                                        </a>
                                    </form>
                                    <hr/>
                                    <div className="text-center">
                                        <a className="small" href="/forgot">패스워드가 기억나지 않나요?</a>
                                    </div>
                                    <div className="text-center">
                                        <a className="small" href="/member">회원가입하기</a>
                                    </div>
                                </div>
         </Col>
         </Row>
         </Card.Body>
         </Card>

            </Col>

        </Row>

</Container>

        </>
    )
}
export default Home;