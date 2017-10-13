/* Footer 页面底部 */
import React from 'react';
import P from 'prop-types';

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div className="footer">
                © 2017 <a href="http://yimaokeji.com" target="_blank" rel="noopener noreferrer">yimaokeji.com</a> Yimao Technology Development (Shanghai) Co,.Ltd.
            </div>
        );
    }
}

Footer.propTypes = {
};

export default Footer;
