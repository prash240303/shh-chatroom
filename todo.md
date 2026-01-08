# Listing out UI features

- [ ] Base URL (/home) Website UI
- [ ] Logout button, confirmation popover needed
- [ ] welcoming Toast message, on logout
- [ ] Toast message content need refactor
- [ ] Toast UI color fix
- [ ] users able to see other user typing indicator (live)
- [ ] persistent text formatting
- [ ] support of text formatting : bold, italics _etc_

# Product features

- [ ] End to end encryption with RSA/AES (to be implemented at last)
- [ ] media support
- [ ] error handling of all cases
- [ ] API optimisations
- [ ] Login, refresh tokens
- [ ] Form validations at login and register

# Features achieved

- [x] Color themes, UI accessible in 5 beautiful color themes
- [x] websockets working properly, with live messsage, sending and receiving
- [x] Login and Register pages, beautified
- [x] UI color related bugs fixed.

# Auth flow

- [x] Store access token in memory (React state / context)
- [x] Implement refresh token logic in backend
- [x] Create POST /refresh API
- [x] Backend sets refresh token as HttpOnly cookie on login
- [x] On API 401 → call /refresh
- [x] Retry original request if refresh succeeds
- [x] Redirect to login if /refresh returns 401
- [x] Call /refresh once on app startup
- [x] Implement refresh token rotation
