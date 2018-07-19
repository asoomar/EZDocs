import React from 'react';
import MainEditor from './components/MainEditor';
import Login from './components/Login';
import Register from './components/Register';
import DocPortal from './components/DocPortal';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      currentPage: 'Login',
      editor: null,
      editorId: null,
      editorTitle: null,
      document: null,
    };
  }
  updatePage(newPage) {
    this.setState({ currentPage: newPage });
  }
  updateEditor(newEditor, id, title, doc) {
    this.setState({ editor: newEditor, editorId: id, editorTitle: title, document: doc });
    console.log('State of editor was updated!');
    setTimeout(() => console.log(this.state), 1000);
  }
  render() {
    return (<div>
      {this.state.currentPage === 'Login' ?
        <Login redirect={page => this.updatePage(page)} /> : null}
      {this.state.currentPage === 'Register' ?
        <Register redirect={page => this.updatePage(page)} /> : null}
      {this.state.currentPage === 'Document' ?
        <DocPortal
          redirect={page => this.updatePage(page)}
          editor={(editor, id, title, doc) => this.updateEditor(editor, id, title, doc)}
        /> : null}
      {this.state.currentPage === 'Editor' ?
        <MainEditor
          redirect={page => this.updatePage(page)}
          currentEditor={this.state.editor}
          editorId={this.state.editorId}
          editorTitle={this.state.editorTitle}
          document={this.state.document}
        /> : null}
    </div>);
  }
}
