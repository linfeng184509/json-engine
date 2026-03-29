## ADDED Requirements

### Requirement: Login Page Schema Structure

The login page SHALL be defined as a JSON Schema with name, props, state, computed, methods, lifecycle, render, and styles sections.

#### Scenario: Valid login schema structure

- **WHEN** login.json schema is loaded with all required sections (name, state, render)
- **THEN** the system SHALL parse and render the login page without errors

### Requirement: Form State Management

The login page SHALL use reactive state to store form data including username, password, captcha code, and rememberMe flag.

#### Scenario: Form data initialization

- **WHEN** login page is mounted
- **THEN** state.formData SHALL be initialized with empty username, empty password, null captcha, and false rememberMe

#### Scenario: Form data update

- **WHEN** user inputs text into username field
- **THEN** state.formData.username SHALL be updated to the input value

### Requirement: Loading State

The login page SHALL use a ref state to track submission loading status.

#### Scenario: Loading state during submission

- **WHEN** user submits login form and API request is in progress
- **THEN** state.loading SHALL be true and submit button SHALL show loading indicator

#### Scenario: Loading state after success

- **WHEN** login API returns success
- **THEN** state.loading SHALL be reset to false

### Requirement: Form Validation

The login page SHALL validate form inputs before submission.

#### Scenario: Empty username validation

- **WHEN** user submits form with empty username
- **THEN** validation SHALL fail with error message "Username is required"

#### Scenario: Empty password validation

- **WHEN** user submits form with empty password
- **THEN** validation SHALL fail with error message "Password is required"

#### Scenario: Invalid captcha validation

- **WHEN** user submits form with incorrect captcha code
- **THEN** validation SHALL fail with error message "Invalid captcha"

### Requirement: Computed Properties

The login page SHALL use computed properties to derive form validity and button disabled state.

#### Scenario: isValid computed property

- **WHEN** username and password are both non-empty
- **THEN** computed.isValid.value SHALL be true

#### Scenario: submitDisabled computed property

- **WHEN** loading is true OR isValid is false
- **THEN** computed.submitDisabled.value SHALL be true

### Requirement: Login Submission Method

The login page SHALL have a handleLogin method that submits credentials to auth API.

#### Scenario: Successful login submission

- **WHEN** handleLogin is called with valid credentials
- **THEN** the method SHALL call POST /api/auth/login with formData
- **AND** on success SHALL store token and redirect to dashboard

#### Scenario: Failed login submission

- **WHEN** handleLogin is called with invalid credentials
- **THEN** the method SHALL display error message from API response
- **AND** SHALL NOT redirect

### Requirement: Captcha Handling

The login page SHALL have a method to fetch and display captcha image.

#### Scenario: Captcha fetch on mount

- **WHEN** login page is mounted
- **THEN** handleCaptcha method SHALL be called to fetch captcha from GET /api/auth/captcha

#### Scenario: Captcha refresh

- **WHEN** user clicks captcha image
- **THEN** handleCaptcha method SHALL be called to refresh captcha

### Requirement: Ant Design Form Rendering

The login page render section SHALL use Ant Design Vue Form component with FormItem children for each input.

#### Scenario: Form component rendering

- **WHEN** render template specifies type='a-form' with props
- **THEN** the system SHALL render Ant Design Form component with specified properties

#### Scenario: Input component rendering

- **WHEN** render template specifies type='a-input' inside form item
- **THEN** the system SHALL render Ant Design Input component bound to formData via vModel directive

### Requirement: Login Page Styling

The login page SHALL have scoped CSS styles following Ant Design design values.

#### Scenario: Container centering

- **WHEN** styles define .login-container
- **THEN** the container SHALL be centered horizontally and vertically with max-width 400px

#### Scenario: Form styling

- **WHEN** styles define form element spacing
- **THEN** spacing SHALL follow 8px grid rule (margin-bottom: 16px or 24px)

### Requirement: Design Specification Compliance

The login page SHALL comply with Ant Design specification values.

#### Scenario: Canvas width

- **WHEN** login page is rendered on desktop
- **THEN** the effective canvas width SHALL be 1440px (content centered within)

#### Scenario: Brand color

- **WHEN** login button is rendered
- **THEN** the primary button color SHALL be #1677ff (Ant Design blue-6)

#### Scenario: Typography

- **WHEN** text is rendered on login page
- **THEN** base font size SHALL be 14px with line-height 22px