// import React from 'react'

// export const alert = (props) => {
//     return (
//         <div>
            
//         </div>
//     )
// }

import React from 'react'

const Alert = (props) => {
    return (
        <div>
            <div className="alert alert-primary" role="alert">
                {props.message}
            </div>
        </div>
    )
}

export default Alert


