# Architecture rules

- Record browser-side application errors through validated TanStack server functions into a private, admin-readable database table so anonymous site visitors can report failures without direct database write access.