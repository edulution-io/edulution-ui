/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

const getLoginScript = (user: string, password: string) => `
    function fillAndSubmitLoginForm() {
      const usernameField = document.querySelector('input[ng\\:model="username"]');
      const passwordField = document.querySelector('input[ng\\:model="password"]');

      if (usernameField && passwordField) {
        usernameField.value = '${user}';
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));

        passwordField.value = '${password}';
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
  
        const submitButton = document.querySelector('a.btn.btn-primary.btn-block');
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      fillAndSubmitLoginForm();
    });

    // If DOMContentLoaded has already fired
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fillAndSubmitLoginForm();
    }
  `;

export default getLoginScript;
