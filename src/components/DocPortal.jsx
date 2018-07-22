import React from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import NewDoc from './NewDoc';
import CollabDoc from './CollabDoc';

export default class DocPortal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { newDoc: false, collab: false, share: [], documents: [] };
  }
  toggleNewDoc() {
    this.setState({ newDoc: !this.state.newDoc });
  }
  getMyDocs() {
    fetch('http://localhost:1337/mydocs', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      credentials: 'same-origin',
      mode: 'cors',
    }).then((response) => {
      return response.json();
    })
      .then((resp) => {
        if (resp.success === true) {
          let shareArray = new Array(resp.docs.length);
          shareArray.fill(false);
          let myDocs = [...resp.docs];
          myDocs.forEach((doc) => {
            doc.isOwner = true;
          });
          this.setState({ documents: resp.docs, share: shareArray });
          this.getCollabDocs();
        } else {
          console.log('Could not get your documents!');
        }
      })
      .catch((err) => {
        console.log(`Error in getting documents ${err}`);
      });
  }
  getCollabDocs() {
    console.log('Getting documents you collaborate in!');
    fetch('http://localhost:1337/mycollabdocs', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      credentials: 'same-origin',
      mode: 'cors',
    }).then((response) => {
      return response.json();
    })
      .then((resp) => {
        if (resp.success === true) {
          let collab = [...resp.docs];
          collab.forEach((doc) => {
            doc.isOwner = false;
          });
          let moreDocs = [...this.state.documents, ...collab];
          let shareArray = new Array(moreDocs.length);
          shareArray.fill(false);
          this.setState({ documents: moreDocs, share: shareArray });
        } else {
          console.log('Could not get your collab documents!');
        }
      })
      .catch((err) => {
        console.log(`Error in getting collab documents ${err}`);
      });
  }
  changeView(editors, id, title, doc) {
    if (editors.length !== 0) {
      console.log(editors[editors.length - 1]);
      this.props.editor(editors[editors.length - 1].editorState, id, title, doc);
    } else {
      this.props.editor(null, id, title, doc);
    }
    this.props.redirect('Editor');
  }
  toggleShare(index) {
    let shareArray = [...this.state.share];
    shareArray[index] = !shareArray[index];
    this.setState({ share: shareArray });
  }
  toggleCollab() {
    this.setState({ collab: !this.state.collab });
  }
  logout() {
    fetch('http://localhost:1337/logout', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      credentials: 'same-origin',
      mode: 'cors',
    }).then((response) => {
      return response.json();
    })
      .then((resp) => {
        if (resp.success === true) {
          this.props.redirect('Login');
        } else {
          console.log('Could not logout');
        }
      })
      .catch((err) => {
        console.log(`Error in logging out ${err}`);
      });
  }
  componentDidMount() {
    this.getMyDocs();
  }
  render() {
    return (<div className={'bodyContainer'}>
      <div className={'logout'}>
        <Button size={'mini'} onClick={() => this.logout()}>Logout</Button>
      </div>
      <h1 className={'title'} style={{ marginTop: '20px' }}>Document Portal</h1>
      <div className={'myDocs'}>
        <div className={'docsHeader'}>
          <div className={'docDets'}><h2>My Documents</h2></div>
          <div className={'docDets'}>
            <Button circular size={'mini'} icon={'refresh'} onClick={() => this.getMyDocs()} />
          </div>
        </div>
        {this.state.documents.map((doc, i) => (
          <div className={'docHolder'} key={i}>
            <div className={'docInfo'}>
              <b className={'docTitle'}>{doc.title}</b>
              {doc.isOwner ? <em>Owner</em> : <em>Collaborator</em>}
              <div>
                <Button size={'mini'} onClick={() => this.toggleShare(i)}>Share</Button>
                <Button
                  primary
                  size={'mini'}
                  onClick={() => this.changeView(doc.content, doc._id, doc.title, doc)}
                >Edit</Button>
              </div>
            </div>
            {this.state.share[i] ?
              <div className={'docMoreInfo'}>
                <div>
                  <div className={'docDetails'}><b>Id: </b><em>{doc._id} </em></div>
                  <div className={'docDetails'}><b>Password: </b><em>{doc.password}</em></div>
                </div>
              </div> : null}
          </div>
        ))}
        <div className={'docButton'}>
          {this.state.newDoc ?
            <NewDoc toggleDoc={() => this.toggleNewDoc()} rerender={() => this.getMyDocs()} /> :
            <div>
              {this.state.collab ?
                <CollabDoc
                  toggleCollab={() => this.toggleCollab()}
                  rerender={() => this.getMyDocs()}
                />
                :
                <div className={'alignButtons'}>
                  <Button size={'small'} onClick={() => this.toggleCollab()}>Collaborate</Button>
                  <Button primary size={'small'} onClick={() => this.toggleNewDoc()}>New Document</Button>
                </div>
              }
            </div>
            }
        </div>
      </div>
    </div>);
  }
}
