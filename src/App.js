import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { EditorState, convertToRaw, convertFromRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import InnerHTML from 'dangerously-set-html-content'
import axios from 'axios';

function App() {
  // 1
  const [image, setImage] = useState("");
  const [description, setDescription] = useState(EditorState.createEmpty());
  const [descriptionHTML, setDescriptionHTML] = useState('');
  const [show, setShow] = useState(true);
  const [blogs, setBlogs] = useState([]);


  const uploadCallback = (file) => {
    return new Promise(
      (resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);

        fetch('http://localhost:4000/blogs/upload', {
          method: 'POST',
          body: formData
        })
          .then(res => res.json())
          .then(resData => {
            console.log(resData)
            resolve({ data: { link: resData } });
          })
          .catch(error => {
            console.log(error)
            reject(error.toString())
          })
      })

  };


  useEffect(() => {
    axios
      .get("http://localhost:4000/blogs/")
      .then(res => setBlogs(res.data))
      .catch(err => console.error(err));
  }, []);

  //     axios.post('http://localhost:4000/blogs/upload', formData)
  //       .then(res => res.json())
  //       .then(resData => {
  //         console.log(resData);
  //         resolve({ data: { link: resData } });
  //       })
  //       .catch(error => {
  //         console.log(error)
  //         reject(error.toString())
  //       })
  //   }
  //     );
  // }


  const config = {

    image: { uploadCallback: uploadCallback, previewImage: true },
  };

  return (
    <div className="">
      <form onSubmit={(e) => {
        e.preventDefault();
        axios
          .post("http://localhost:4000/blogs/post", { description: descriptionHTML })
          .then(res => console.log(res))
          .catch(err => console.error(err));
      }}>
        <h1>
          Convert to HTML
        </h1>
        {show && <Editor
          wrapperClassName="wrapper-class"
          editorClassName="editor-class"
          toolbarClassName="toolbar-class"
          editorState={description}
          onEditorStateChange={(editorState) => {
            setDescription(editorState);
            setDescriptionHTML(draftToHtml(convertToRaw(description.getCurrentContent())));
          }}
          toolbar={config}
        />}
        <button type='submit'>Post</button>
      </form>
      <button onClick={(e) => { setShow(!show) }}>Toggle View</button>
      <textarea
        rows={"5"}
        value={descriptionHTML}
        onChange={(e) => {
          const editorHTML = e.target.value

          let editor
          const contentBlock = htmlToDraft(editorHTML)
          if (contentBlock) {
            const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
            editor = EditorState.createWithContent(contentState)
          } else {
            editor = EditorState.createEmpty()
          }
          setDescription(editor);
          setDescriptionHTML(editorHTML);
        }}
      />
      {blogs.map((blog, index) => (


        // <div dangerouslySetInnerHTML={{ __html: blog.description }}></div>
        <InnerHTML html={blog.description} />



      ))
      }

      {/* <h1>
        Convert to and from JSON
      </h1>
      <Editor
        onContentStateChange={(contentState) => { setContentState(contentState) }}
      />
      <textarea
        disabled
        value={JSON.stringify(contentState, null, 4)}
      /> */}
    </div >
  );
}

export default App;
