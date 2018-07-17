import React from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import { colorStyleMap } from 'draft-js-color-picker-plugin';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';

const styleMap = {
  'UPPERCASE': {
    textTransform: 'uppercase',
  },
  'LOWERCASE': {
    textTransform: 'lowercase',
  },
};

class MainEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { editorState: EditorState.createEmpty() };
    this.onChange = editorState => this.setState({ editorState });
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

  _onAlignLeftClick(e) {
    e.preventDefault();
    this.onChange(RichUtils.toggleAlignment(this.state.editorState, 'centerAlign'));
  }

  render() {
    return (
      <div>
        <div className={'toolbar'}>
          <FloatingActionButton color="primary" onMouseDown={e => this._onStyleClick(e, 'BOLD')}>
            <i className="material-icons">format_bold</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onStyleClick(e, 'ITALIC')}>
            <i className="material-icons">format_italic</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onStyleClick(e, 'UNDERLINE')}>
            <i className="material-icons">format_underline</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onStyleClick(e, 'STRIKETHROUGH')}>
            <i className="material-icons">format_strikethrough</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onStyleClick(e, 'UPPERCASE')}>
            <i className="material-icons">arrow_upward</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onStyleClick(e, 'LOWERCASE')}>
            <i className="material-icons">arrow_downward</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onUnorderedListClick(e)}>
            <i className="material-icons">format_list_bulleted</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onOrderedListClick(e)}>
            <i className="material-icons">format_list_numbered</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onUndoClick(e)}>
            <i className="material-icons">undo</i>
          </FloatingActionButton>
          <FloatingActionButton color="secondary" onMouseDown={e => this._onRedoClick(e)}>
            <i className="material-icons">redo</i>
          </FloatingActionButton>
        </div>
        <div className={'editor'}>
          <Editor
            editorState={this.state.editorState}
            customStyleMap={styleMap}
            onChange={this.onChange}
            onTab={this.onTab}
            spellCheck={true}
          />
        </div>
      </div>);
  }
}

export default MainEditor;
