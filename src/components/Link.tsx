import React from 'react'
import { Link as RouterLink, LinkProps } from 'react-router-dom'

const Link: React.FC<LinkProps> = (props) => (
    <RouterLink
        {...props}
        state={{
            ...props.state,
            canGoBack: true,
        }}
    />
)
export default Link
