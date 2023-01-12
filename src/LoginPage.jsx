import React from 'react';
import { Layout, Button, Input, Icon, Form, Row, Col, Card } from 'antd';
import logo from './assets/btpn.png';
import { ReactComponent as Logo } from './assets/twilio-mark-red.svg';

const { Content } = Layout;

export class LoginPage extends React.Component {
    handleSubmit = e => {
        e.preventDefault();

        const { form, onSubmit } = this.props;

        form.validateFields((err, values) => {
            if (!err) {
                const { username, conversationSid } = values;
                console.log('conversation', conversationSid);
                onSubmit(username, conversationSid);
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        const usernameFieldDecorator = getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
        });
        const conversationFieldDecorator = getFieldDecorator('conversationSid', {
            rules: [],
        });

        return (
            <Layout>
                <Content style={{ height: '100vh' }}>
                    <Row type="flex" justify="space-around" align="middle" style={{ height: '100%' }}>
                        <Col span={12} offset={6}>
                            <Card style={{ maxWidth: '404px' }}>
                                <Row type="flex" justify="center" align="middle" style={{ marginBottom: '30px' }}>
                                    <img src={logo} alt={Logo}></img>
                                </Row>

                                <Form onSubmit={this.handleSubmit}>
                                    <Form.Item>
                                        {usernameFieldDecorator(
                                            <Input
                                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                                                placeholder="Room Name"
                                            />,
                                        )}
                                        {conversationFieldDecorator(
                                            <Input
                                                prefix={<Icon type="home" style={{ color: 'rgba(0,0,0,.25)' }}/>}
                                                placeholder="Conversation Sid"
                                            />,
                                        )}
                                    </Form.Item>
                                    <Form.Item>
                                        <Button block type="primary" htmlType="submit">
                                            Sign in
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        )
    }
}

export default Form.create({ name: 'login' })(LoginPage);
