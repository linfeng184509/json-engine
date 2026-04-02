## ADDED Requirements

### Requirement: Modal API accessible in schema
The Modal.confirm, Modal.info, Modal.success, Modal.error APIs SHALL be accessible via `_antd.modal` scope.

#### Scenario: Modal.confirm in method
- **WHEN** schema defines method body `{{$_antd.modal.confirm({ title: 'Confirm', content: 'Are you sure?' })}}`
- **THEN** the system SHALL call Modal.confirm and display confirmation dialog

#### Scenario: Modal.info in lifecycle
- **WHEN** schema defines onMounted body `{{$_antd.modal.info({ title: 'Info', content: 'Welcome' })}}`
- **THEN** the system SHALL call Modal.info on component mount

### Requirement: Message API accessible in schema
The message.success, message.error, message.warning, message.info APIs SHALL be accessible via `_antd.message` scope.

#### Scenario: message.success after action
- **WHEN** schema defines method body `{{$_antd.message.success('Operation completed')}}`
- **THEN** the system SHALL display success message notification

#### Scenario: message.error on failure
- **WHEN** schema defines method body `{{$_antd.message.error('Operation failed')}}`
- **THEN** the system SHALL display error message notification

### Requirement: Notification API accessible in schema
The notification.success, notification.error, notification.warning, notification.info APIs SHALL be accessible via `_antd.notification` scope.

#### Scenario: notification with placement
- **WHEN** schema defines method body `{{$_antd.notification.success({ message: 'Success', description: 'Task completed', placement: 'topRight' })}}`
- **THEN** the system SHALL display notification at topRight position

### Requirement: Form.useForm accessible in schema (optional)
The Form.useForm API SHALL be optionally accessible via `_antd.form.useForm` for advanced form validation.

#### Scenario: useForm validation setup
- **WHEN** schema uses `_antd.form.useForm` in computed or state initialization
- **THEN** the system SHALL provide validateInfos and resetFields functions