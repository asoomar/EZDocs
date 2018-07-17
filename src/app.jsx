import React from 'react';
import MainEditor from './components/MainEditor';
import Login from './components/Login';
import Register from './components/Register';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { currentPage: 'Login' };
  }
  updatePage(newPage) {
    this.setState({ currentPage: newPage });
  }
  render() {
    return (<div>
      {this.state.currentPage === 'Login' ?
        <Login redirect={page => this.updatePage(page)} /> : null}
      {this.state.currentPage === 'Register' ?
        <Register redirect={page => this.updatePage(page)} /> : null}
      {this.state.currentPage === 'Document' ? <MainEditor redirect={this.redirect} /> : null}
    </div>);
  }
}
