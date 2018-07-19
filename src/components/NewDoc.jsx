import React from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';

export default class NewDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: '', password: '', confirmPassword: '' };
  }
  makeDoc() {
    console.log('Attempting to make document!');
    this.props.toggleDoc();
    if(this.state.password === this.state.confirmPassword) {
      fetch('http://localhost:1337/newdocument', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        mode: 'cors',
        body: JSON.stringify({
          title: this.state.title,
          password: this.state.password,
        }),
      }).then((response) => {
        console.log(response);
        return response.json();
      })
        .then((resp) => {
          console.log(resp);
          if (resp.success === true) {
            console.log('Obtained docs!');
            this.props.rerender();
          } else {
            console.log('Error in making new document');
          }
        })
        .catch((err) => {
          console.log(`Error in making new document: ${err}`);
        });
    }
  }
  updateTitle(e) {
    this.setState({ title: e.target.value });
  }
  updatePassword(e) {
    this.setState({ password: e.target.value });
  }
  updateConfirmPassword(e) {
    this.setState({ confirmPassword: e.target.value });
  }
  render() {
    return (<div className={'newDocForm'}>
      <Form>
        <Form.Group widths={'equal'}>
          <Form.Field control={Input} label={'Title'} size="small" placeholder={'Title'} value={this.state.title} onChange={e => this.updateTitle(e)} />
          <Form.Field control={Input} label={'Password'} size="small" placeholder={'Password'} type={'password'} value={this.state.password} onChange={e => this.updatePassword(e)} />
          <Form.Field control={Input} label={'Confirm Password'} size="small" placeholder={'Confirm Password'} type={'password'} value={this.state.confirmPassword} onChange={e => this.updateConfirmPassword(e)} />
        </Form.Group>
        <div className={'alignButtons'}>
          <Button type={'button'} size="small" onClick={() => this.props.toggleDoc()}>Cancel</Button>
          <Button type={'button'} size="small" primary onClick={() => this.makeDoc()}>Create</Button>
        </div>
      </Form>
    </div>);
  }
}
