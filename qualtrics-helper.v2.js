/**
 * QualtricsHelper
 *
 * A utility object that provides helper methods for Qualtrics forms,
 * particularly when embedded in iframes. It handles automatic height
 * adjustments, communication with parent windows, and other embedding-related
 * functionality.
 *
 * @namespace QualtricsHelper
 */
(function() {
  window.QualtricsHelper = {
      version: '2025.06.25.01',
      debugMode: false,
      includeStandAloneFooter: false,

      /**
       * Run the script.
       * @param {boolean} [debug=false] - Optional flag to enable debug mode
       */
      init(options) {
          this.debugMode = options.debug;
          this.includeStandAloneFooter = options.includeStandAloneFooter;

          if (this.debugMode) {
              console.log("Initializing Qualtrics theme helper. v" + this.version);
          }

          // If the form is embedded in an iframe, we need to resize the iframe and add the Qualtrics theme.
          if (this.formIsInAnIframe()) {
              const frameType = this.getFrameType(document.URL);

              if (frameType === "embed") {
                  document.body.classList.add('embedded');
                  this.setupHeightReporting();
              }
              else if(frameType === "intercept") {
                  document.body.classList.add('intercept');
              }
          }
          // If the form is not embedded in an iframe, we can add the stand-alone footer.
          else {
              if (this.includeStandAloneFooter) {
                  this.addDefaultFooter();
              }
          }
      },

      /**
       * Checks if the current Qualtrics form is running inside an iframe.
       * @returns {boolean} True if the form is embedded in an iframe, false otherwise.
       */
      formIsInAnIframe() {
          return window.self !== window.top;
      },

      /**
       * Sets up automatic height reporting for embedded Qualtrics forms.
       * Adds necessary event listeners and observers to keep the parent iframe size in sync with content.
       */
      setupHeightReporting() {
          if (this.debugMode) {
              console.log('Qualtrics form is embedded in a parent page.');
          }

          // Let the body height be what it is.
          document.body.style.height = 'auto';

          // Calculate the iframe height after form is loaded
          window.addEventListener('load', this.resizeIframe());

          // Monitor for changes in the document
          const observer = new MutationObserver(() => this.resizeIframe());
          observer.observe(document.body, {attributes: true, childList: true, subtree: true});
      },

      /**
       * Send a message to the parent window to set the height of the iFrame.
       */
      resizeIframe() {
          const message = {
              from: 'JFE',
              to: 'SI',
              event: 'sendingSurveyHeight',
              value: document.body.scrollHeight + "px"
          };

          parent.postMessage(JSON.stringify(message), '*');

          if (this.debugMode) {
              console.log(`Form height is ${message.value}`);
          }
      },

      /**
       * Evaluate the iFrame SRC to determine the type of Qualtrics embed.
       */
      getFrameType(src) {
          if (src.includes('Q_CanScreenCapture')) {
              // Example: https://iowa.gov1.qualtrics.com/jfe/form/SV_5iJmVoHC5mKW3Vc?Q_CHL=si&Q_CanScreenCapture=1
              return 'intercept';
          }

          return 'embed';
      },

      /**
       * Force the alt text on the logo image since it doesn't have a field for this.
       * @param {string} text
       */
      setLogoAltText(text) {
          let img;
          if (img = document.querySelector('#LogoContainer img, #logo-container img')) {
              img.alt = text;
          }

          // Note: We tried putting an observer around this but it sends the preview
          // into an infinite loop.
      },

      /**
       * Add a footer to forms to match the iowa.gov footer.
       */
      addDefaultFooter() {
          const date = new Date();
          const year = date.getFullYear();
          const footerHTML = `<footer id="iowa-footer">
  <article class="footer__global-footer">
      <div class="flex-wrapper">
          <div class="footer__inner footer__inner-2">
              <p class="footer__copyright">
                  &copy; <span class="footer__copyright-year">${year}</span> State of Iowa - Read our <a
                      href="https://www.iowa.gov/policies" class="link-paragraph link-paragraph--small"
                      target="_blank">accessibility, data, and privacy policies</a>.
              </p>
          </div>
      </div>
  </article>
</footer>`;

          document.body.insertAdjacentHTML('beforeend', footerHTML);
      }
  };
})();
