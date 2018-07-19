import React from 'react';
import { Editor,
  EditorState,
  RichUtils,
  ContentState,
  convertFromRaw,
  convertToRaw,
  DefaultDraftBlockRenderMap,
} from 'draft-js';
import { Button, Input, Header, Icon, Dropdown, Modal } from 'semantic-ui-react';
import { CompactPicker } from 'react-color';
import { Map } from 'immutable';
import io from 'socket.io-client';


const styleMap = {
  'UPPERCASE': {
    textTransform: 'uppercase',
  },
  'LOWERCASE': {
    textTransform: 'lowercase',
  },
};

const fontSizes = [
  { text: '4', value: 4 },
  { text: '8', value: 8 },
  { text: '10', value: 10 },
  { text: '12', value: 12 },
  { text: '14', value: 14 },
  { text: '16', value: 16 },
  { text: '20', value: 20 },
  { text: '24', value: 24 },
  { text: '30', value: 30 },
  { text: '36', value: 36 },
  { text: '42', value: 42 },
  { text: '50', value: 50 },
  { text: '64', value: 64 },
  { text: '72', value: 72 },
  { text: '90', value: 90 },
];

const myBlockTypes = DefaultDraftBlockRenderMap.merge(new Map({
  center: {
    wrapper: <div className={'center-align'} />,
  },
  right: {
    wrapper: <div className={'right-align'} />,
  },
  left: {
    wrapper: <div className={'left-align'} />,
  },
  justify: {
    wrapper: <div className={'justify-align'} />,
  },
}));

class MainEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty(),
      editTitle: false,
      inlineStyles: {},
      fontSize: 12,
    };
    this.onChange = editorState => this.setState({ editorState });
  }

  componentDidMount() {
    console.log('Updating document with last save!');
    console.log(this.props.currentEditor);
    if (this.props.currentEditor) {
      const rawCont = JSON.parse(this.props.currentEditor);
      this.setState({ editorState: EditorState.createWithContent(convertFromRaw(rawCont)) });
    }
    this.setState({ title: this.props.editorTitle });

    const socket = io('http://localhost:1337');
    socket.on('connect', () => { console.log('ws connect'); });
    socket.on('disconnect', () => { console.log('ws disconnect'); });
    socket.emit('msg', 'Does this work?');
    socket.on('msg', (data) => {
      console.log('ws msg:', data);
      socket.emit('cmd', { foo:123 });
    });
  }

  _onStyleClick(e, style) {
    e.preventDefault();
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
  }

  _onUndoClick(e) {
    e.preventDefault();
    this.onChange(EditorState.undo(this.state.editorState));
  }

  _onRedoClick(e) {
    e.preventDefault();
    this.onChange(EditorState.redo(this.state.editorState));
  }

  _onUnorderedListClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'unordered-list-item'));
  }

  _onOrderedListClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, 'ordered-list-item'));
  }

  _onTextAlign(e, align) {
    e.preventDefault();
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, align));
  }
  goBack() {
    this.props.redirect('Document');
  }
  saveCurrent() {
    console.log('Saving...');
    console.log(this.props);
    const rawData = JSON.stringify(convertToRaw(this.state.editorState.getCurrentContent()));
    fetch('http://localhost:1337/save', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      mode: 'cors',
      body: JSON.stringify({
        title: this.props.editorTitle,
        id: this.props.editorId,
        editor: rawData,
      }),
    }).then((response) => {
      console.log(response);
      return response.json();
    })
      .then((resp) => {
        console.log(resp);
        if (resp.success === true) {
          console.log('Saved document!');
        } else {
          console.log('Could not save document');
        }
      })
      .catch((err) => {
        console.log(`Error in saving this document: ${err}`);
      });
  }
  saveTitle() {
    fetch('http://localhost:1337/savetitle', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      mode: 'cors',
      body: JSON.stringify({
        id: this.props.document._id,
        newTitle: this.state.title,
      }),
    }).then((response) => {
      console.log(response);
      return response.json();
    })
      .then((resp) => {
        console.log(resp);
        if (resp.success === true) {
          console.log('Document renamed!');
        } else {
          console.log('Could not rename document');
        }
      })
      .catch((err) => {
        console.log(`Error in renaming this document: ${err}`);
      });
    this.falseEditTitle();
  }
  toggleEditTitle() {
    this.setState({ editTitle: true });
  }
  falseEditTitle() {
    this.setState({ editTitle: false });
  }
  changeTitle(e) {
    this.setState({ title: e.target.value });
  }
  formatColor(color) {
    console.log('Color is ', color);
    const newInlineStyles = Object.assign(
      {},
      this.state.inlineStyles,
      { [color.hex]: { color: color.hex } },
    );
    this.setState({
      inlineStyles: newInlineStyles,
      editorState: RichUtils.toggleInlineStyle(this.state.editorState, color.hex),
    });
  }
  changeFont(val) {
    console.log('Fontsize is ', val.value);
    const newInlineStyles = Object.assign(
      {},
      this.state.inlineStyles,
      { [val.value]: { fontSize: `${val.value}px` } },
    );
    this.setState({
      inlineStyles: newInlineStyles,
      editorState: RichUtils.toggleInlineStyle(this.state.editorState, val.value),
      fontSize: val.value,
    });
  }
  confirmDelete() {
    fetch('http://localhost:1337/deletedoc', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      mode: 'cors',
      body: JSON.stringify({
        id: this.props.document._id,
      }),
    }).then((response) => {
      console.log(response);
      return response.json();
    })
      .then((resp) => {
        console.log(resp);
        if (resp.success === true) {
          console.log('Document Deleted!');
          this.props.redirect('Document');
        } else {
          console.log('Could not delete document');
        }
      })
      .catch((err) => {
        console.log(`Error in deleting this document: ${err}`);
      });
  }

  render() {
    return (
      <div>
        <div className={'topBar'}>
          <div className={'docTitleBar'}>
            <div className={'inline'}><Button compact size={'small'} onClick={() => this.goBack()} icon={'arrow left'} /></div>
            <div className={'inline docTitle'} onClick={() => this.toggleEditTitle()}>
              {this.state.editTitle ?
                <div>
                  <Input
                    transparent
                    size={'small'}
                    value={this.state.title}
                    onChange={e => this.changeTitle(e)}
                  >
                    <input />
                    <Button
                      size={'mini'}
                      onMouseDown={() => this.saveTitle()}
                      icon={'check'}
                    />
                    <Button
                      size={'mini'}
                      onMouseDown={() => this.falseEditTitle()}
                      icon={'x'}
                    />
                  </Input>
                </div>  :
                <h2>{this.state.title}</h2>}
            </div>
          </div>
          <div>
            <Button size={'small'} compact>
              <Dropdown floating icon={'file'}>
                <Dropdown.Menu direction={'left'}>
                  <Dropdown.Item
                    icon={'trash'}
                    text={'Delete document'}
                    onClick={() => this.confirmDelete()}
                  />
                  <Dropdown.Item icon={'users'} text={'Collaborators'} />
                </Dropdown.Menu>
              </Dropdown>
            </Button>
            <Button compact size={'small'} icon={'save'} onClick={() => this.saveCurrent()} />
          </div>
        </div>
        <div className={'toolbar'}>
          <Button.Group>
            <Button
              size={'mini'}
              onMouseDown={e => this._onUndoClick(e)}
              icon={'undo'}
            />
            <Button
              size={'mini'}
              onMouseDown={e => this._onRedoClick(e)}
              icon={'redo'}
            />
          </Button.Group>{' '}
          <Dropdown
            compact
            selection
            defaultValue={this.state.fontSize}
            options={fontSizes}
            onChange={(e, data) => this.changeFont(data)}
          />{' '}
          <Button.Group>
            <Button
              size={'mini'}
              onMouseDown={e => this._onStyleClick(e, 'BOLD')}
              icon={'bold'}
            />
            <Button
              size={'mini'}
              onMouseDown={e => this._onStyleClick(e, 'ITALIC')}
              icon={'italic'}
            />
            <Button
              size={'mini'}
              onMouseDown={e => this._onStyleClick(e, 'UNDERLINE')}
              icon={'underline'}
            />
            <Button
              size={'mini'}
              onMouseDown={e => this._onStyleClick(e, 'STRIKETHROUGH')}
              icon={'strikethrough'}
            />
          </Button.Group>{' '}
          <Dropdown button floating pointing={'top left'} icon={'font'}>
            <Dropdown.Menu>
              <Dropdown.Item selected>
                <CompactPicker
                  onChangeComplete={(c) => this.formatColor(c)}
                />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button.Group>
            <Button
              size={'mini'}
              onMouseDown={e => this._onStyleClick(e, 'UPPERCASE')}
              icon={'chevron up'}
            />
            <Button
              size={'mini'}
              onMouseDown={e => this._onStyleClick(e, 'LOWERCASE')}
              icon={'chevron down'}
            />
          </Button.Group>{' '}
          <Button.Group>
            <Button
              size={'mini'}
              icon={'align left'}
              onMouseDown={e => this._onTextAlign(e, 'left')}
            />
            <Button
              size={'mini'}
              icon={'align center'}
              onMouseDown={e => this._onTextAlign(e, 'center')}
            />
            <Button
              size={'mini'}
              icon={'align right'}
              onMouseDown={e => this._onTextAlign(e, 'right')}
            />
            <Button
              size={'mini'}
              icon={'align justify'}
              onMouseDown={e => this._onTextAlign(e, 'justify')}
            />
          </Button.Group>{' '}
          <Button.Group>
            <Button
              size={'mini'}
              onMouseDown={e => this._onUnorderedListClick(e)}
              icon={'list ul'}
            />
            <Button
              size={'mini'}
              onMouseDown={e => this._onOrderedListClick(e)}
              icon={'list ol'}
            />
          </Button.Group>
        </div>
        <div className={'editorHolder'}>
          <div className={'editor'}>
            <Editor
              editorState={this.state.editorState}
              customStyleMap={this.state.inlineStyles}
              onChange={this.onChange}
              blockRenderMap={myBlockTypes}
              onTab={this.onTab}
              spellCheck={true}
            />
          </div>
        </div>
      </div>);
  }
}

export default MainEditor;
