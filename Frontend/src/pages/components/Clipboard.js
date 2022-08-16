import React,{useState} from 'react'

const Clipboard = ({ copyText }) => {
    const [isCopied, setIsCopied] = useState(false);
    async function copyTextToClipboard(text) {
        if ('clipboard' in navigator) {
          // eslint-disable-next-line no-return-await
          return await navigator.clipboard.writeText(text);
        } 
          return document.execCommand('copy', true, text);
        
      }

      
      const handleCopyClick = () => {
        // Asynchronously call copyTextToClipboard
        copyTextToClipboard(copyText)
          .then(() => {
            // If successful, update the isCopied state value
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 1500);
          })
          .catch((err) => {
            console.log(err);
          });
      }

  return (
<>
<div>
      <input type="text" value={copyText} readOnly />
      {/* Bind our handler function to the onClick button property */}
      <button onClick={handleCopyClick}>
        <span>{isCopied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
</>
  )
}

export default Clipboard