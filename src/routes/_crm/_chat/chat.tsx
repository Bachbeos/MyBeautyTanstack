import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_crm/_chat/chat")({
  component: ChatComponent
});

function ChatComponent() {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* --- PAGE HEADER --- */}
        <div className="d-flex align-items-center justify-content-between gap-2 mb-4 flex-wrap">
          <div>
            <h4 className="mb-1 fw-bold">Chat</h4>
            <div className="text-muted small">Ứng dụng / Chat</div>
          </div>
          <div className="gap-2 d-flex align-items-center flex-wrap">
            <button className="btn btn-icon btn-outline-light shadow">
              <i className="ti ti-refresh"></i>
            </button>
            <button className="btn btn-icon btn-outline-light shadow" id="collapse-header">
              <i className="ti ti-transition-top"></i>
            </button>
          </div>
        </div>

        <div className="chat-wrapper">
          {/* --- SIDEBAR GROUP --- */}
          <div className="sidebar-group">
            <div id="chats" className="sidebar-content active">
              <div className="chat-search-header">
                <div className="header-title d-flex align-items-center justify-content-between">
                  <h5 className="mb-3">Chats</h5>
                </div>
                <div className="search-wrap">
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="Search" />
                    <span className="input-group-text">
                      <i className="ti ti-search"></i>
                    </span>
                  </div>
                </div>
              </div>

              <div className="sidebar-body chat-body" id="chatsidebar">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="chat-title mb-0">All Chats</h5>
                </div>

                <div className="chat-users-wrap">
                  {/* Item 1: Is Typing */}
                  <div className="chat-list active">
                    <div className="chat-user-list cursor-pointer">
                      <div className="avatar avatar-lg online me-2">
                        <img
                          src="assets/img/profiles/avatar-10.jpg"
                          className="rounded-circle"
                          alt="image"
                        />
                      </div>
                      <div className="chat-user-info">
                        <div className="chat-user-msg">
                          <h6>Anthony Lewis</h6>
                          <p>
                            <span className="animate-typing">
                              is typing<span className="dot"></span>
                              <span className="dot"></span>
                              <span className="dot"></span>
                              <span className="dot"></span>
                            </span>
                          </p>
                        </div>
                        <div className="chat-user-time">
                          <span className="time">02:40 PM</span>
                          <div className="chat-pin">
                            <i className="ti ti-pin me-2"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-dropdown">
                      <a className="#" href="#" data-bs-toggle="dropdown">
                        <i className="ti ti-dots-vertical"></i>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-box-align-right me-2"></i>Archive Chat
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-heart me-2"></i>Mark as Favourite
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-check me-2"></i>Mark as Unread
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-pinned me-2"></i>Pin Chats
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-trash me-2"></i>Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Item 2: Document */}
                  <div className="chat-list">
                    <div className="chat-user-list cursor-pointer">
                      <div className="avatar avatar-lg online me-2">
                        <img
                          src="assets/img/profiles/avatar-01.jpg"
                          className="rounded-circle"
                          alt="image"
                        />
                      </div>
                      <div className="chat-user-info">
                        <div className="chat-user-msg">
                          <h6>Elliot Murray</h6>
                          <p>
                            <i className="ti ti-file me-1"></i>Document
                          </p>
                        </div>
                        <div className="chat-user-time">
                          <span className="time">06:12 AM</span>
                          <div className="chat-pin">
                            <i className="ti ti-checks text-success"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-dropdown">
                      <a className="#" href="#" data-bs-toggle="dropdown">
                        <i className="ti ti-dots-vertical"></i>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-box-align-right me-2"></i>Archive Chat
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-heart me-2"></i>Mark as Favourite
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-check me-2"></i>Mark as Unread
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-pinned me-2"></i>Pin Chats
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#">
                            <i className="ti ti-trash me-2"></i>Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- MAIN CHAT MESSAGES --- */}
          <div className="chat chat-messages show" id="middle">
            <div className="chat-header">
              <div className="user-details">
                <div className="d-xl-none">
                  <a className="text-muted chat-close me-1" href="#">
                    <i className="ti ti-circle-arrow-left"></i>
                  </a>
                </div>
                <div className="avatar online flex-shrink-0">
                  <img
                    src="assets/img/profiles/avatar-01.jpg"
                    className="rounded-circle"
                    alt="image"
                  />
                </div>
                <div className="ms-2 overflow-hidden">
                  <h6 className="fw-medium mb-1 text-dark">Anthony Lewis</h6>
                  <p className="fs-13 mb-0">Online</p>
                </div>
              </div>
              <div className="chat-options">
                <ul className="list-unstyled d-flex gap-2">
                  <li>
                    <a
                      href="javascript:void(0)"
                      className="btn chat-search-btn"
                      data-bs-toggle="tooltip"
                      data-bs-placement="bottom"
                      title="Search"
                    >
                      <i className="ti ti-search text-muted"></i>
                    </a>
                  </li>
                  <li>
                    <button className="btn no-bg">
                      <i className="ti ti-search text-muted"></i>
                    </button>
                  </li>
                  <li>
                    <button className="btn no-bg">
                      <i className="ti ti-dots-vertical text-muted"></i>
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="chat-body chat-page-group"
              style={{ height: "calc(100vh - 435px)", overflowY: "auto" }}
            >
              <div className="messages">
                {/* Left Message */}
                <div className="chats">
                  <div className="chat-avatar">
                    <img
                      src="assets/img/profiles/avatar-01.jpg"
                      className="rounded-circle"
                      alt="image"
                    />
                  </div>
                  <div className="chat-content">
                    <div className="chat-info">
                      <div className="message-content">
                        Hi John, I wanted to update you on a new company policy regarding remote
                        work.
                      </div>
                    </div>
                    <div className="chat-profile-name">
                      <h6>
                        Anthony Lewis<i className="ti ti-circle-filled fs-7 mx-2"></i>
                        <span className="chat-time">08:00 AM</span>
                      </h6>
                    </div>
                  </div>
                </div>

                {/* Right Message */}
                <div className="chats chats-right">
                  <div className="chat-content">
                    <div className="chat-info">
                      <div className="message-content">Sure, Sarah. What’s the new policy?</div>
                    </div>
                    <div className="chat-profile-name text-end">
                      <h6>
                        You<i className="ti ti-circle-filled fs-7 mx-2"></i>
                        <span className="chat-time">08:00 AM</span>
                        <span className="msg-read success">
                          <i className="ti ti-checks"></i>
                        </span>
                      </h6>
                    </div>
                  </div>
                  <div className="chat-avatar">
                    <img
                      src="assets/img/profiles/avatar-14.jpg"
                      className="rounded-circle dreams_chat"
                      alt="image"
                    />
                  </div>
                </div>

                <div className="chat-line">
                  <span className="chat-date">Today, July 24</span>
                </div>
              </div>
            </div>

            {/* --- CHAT FOOTER --- */}
            <div className="chat-footer">
              <form className="footer-form">
                <div className="chat-footer-wrap">
                  <div className="form-item">
                    <button type="button" className="action-circle">
                      <i className="ti ti-microphone"></i>
                    </button>
                  </div>
                  <div className="form-wrap w-100">
                    <input
                      type="text"
                      className="form-control shadow-none"
                      placeholder="Type Your Message"
                    />
                  </div>
                  <div className="form-item">
                    <button type="button" className="action-circle">
                      <i className="ti ti-mood-smile"></i>
                    </button>
                  </div>
                  <div className="form-item">
                    <button type="button" className="action-circle">
                      <i className="ti ti-folder"></i>
                    </button>
                  </div>
                  <div className="form-btn">
                    <button className="btn btn-primary" type="submit">
                      <i className="ti ti-send"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
