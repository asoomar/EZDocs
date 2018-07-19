import React from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';

export default class CollabDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = { id: '', password: '' };
  }
  collabDoc() {
    console.log('Attempting to be added as collaborator!');
    this.props.toggleCollab();
    fetch('http://localhost:1337/collaborate', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      mode: 'cors',
      body: JSON.stringify({
        id: this.state.id,
        password: this.state.password,
      }),
    }).then((response) => {
      console.log(response);
      return response.json();
    })
      .then((resp) => {
        console.log(resp);
        if (resp.success === true) {
          console.log('Added as collaborator!');
          this.props.rerender();
        } else {
          console.log('Error in becoming collaborator');
        }
      })
      .catch((err) => {
        console.log(`Error in becoming collaborator: ${err}`);
      });
  }
  updateId(e) {
    this.setState({ id: e.target.value });
  }
  updatePassword(e) {
    this.setState({ password: e.target.value });
  }
  render() {
    return (<div className={'newDocForm'}>
      <Form>
        <Form.Group widths={'equal'}>
          <Form.Field control={Input} label={'Document Id'} size="small" placeholder={'Id'} value={this.state.id} onChange={e => this.updateId(e)} />
          <Form.Field control={Input} label={'Password'} size="small" placeholder={'Password'} type={'password'} value={this.state.password} onChange={e => this.updatePassword(e)} />
        </Form.Group>
        <div className={'alignButtons'}>
          <Button type={'button'} size="small" onClick={() => this.props.toggleCollab()}>Cancel</Button>
          <Button type={'button'} size="small" primary onClick={() => this.collabDoc()}>Collaborate</Button>
        </div>
      </Form>
    </div>);
  }
}
