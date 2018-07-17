import React from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '', error: false };
  }
  updateUsername(e) {
    this.setState({ username: e.target.value });
  }
  updatePassword(e) {
    this.setState({ password: e.target.value });
  }
  checkLogin() {
    fetch('http://localhost:1337/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      mode: 'cors',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    }).then((response) => {
      return response.json();
    })
      .then((resp) => {
        if (resp.success === true) {
          this.props.redirect('Document');
        } else {
          this.setState({ error: true });
        }
      })
      .catch((err) => {
        console.log(`Error in signup: ${err}`);
        this.setState({ error: true });
      });
  }
  render() {
    return (<div className={'center'}>
      <h1 className={'title'}>Welcome to EZ-Docs</h1>
      <h2>Login</h2>
      {this.state.error ?
        <Message negative size="mini"><p>Error: Username and password do not match</p></Message>
        : null}
      <Form>
        <Form.Field>
          <label>Username</label>
          <Input placeholder={'Username'} value={this.state.username} onChange={e => this.updateUsername(e)} />
        </Form.Field>
        <Form.Field>
          <label>Password</label>
          <Input placeholder={'Password'} type={'password'} value={this.state.password} onChange={e => this.updatePassword(e)} />
        </Form.Field>
        <Button primary type="submit" onClick={() => this.checkLogin()}>Login</Button>
        <Button type="submit" onClick={() => this.props.redirect('Register')}>Register</Button>
      </Form>
    </div>);
  }
}
