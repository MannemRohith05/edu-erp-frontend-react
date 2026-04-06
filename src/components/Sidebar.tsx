import { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

interface MenuItem {
    label: string;
    icon: string;
    route?: string;
    children?: { label: string; route: string }[];
}

interface SidebarProps {
    userId: string;
    isCollapsed: boolean;
    searchQuery: string;
    onLogout: () => void;
    onToggle: (collapsed: boolean) => void;
}

const menuItems: MenuItem[] = [
    { label: 'Home', icon: '🏠', route: '/student' },
    { label: 'Course Registration', icon: '📝', route: '/student/academic/regular' },
    { label: 'Attendance Register', icon: '📋', route: '/student/attendance' },
    {
        label: 'Courses', icon: '📚',
        children: [
            { label: 'My Courses', route: '/student/courses/assignments' },
            { label: 'Internals / Marks', route: '/student/courses/internals' },
        ],
    },
    {
        label: 'Exam Section', icon: '📝',
        children: [
            { label: 'End Exam Results', route: '/student/exam/results' },
        ],
    },
    { label: 'Fee Payments', icon: '💳', route: '/student/fees/payments' },
    { label: 'My CGPA', icon: '📊', route: '/student/cgpa' },
    { label: 'Profile', icon: '👤', route: '/student/profile/view' },
    { label: 'Time Table', icon: '📅', route: '/student/timetable' },
];

export default function Sidebar({ userId, isCollapsed, searchQuery, onLogout, onToggle }: SidebarProps) {
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const filteredMenuItems = useMemo(() => {
        if (!searchQuery || searchQuery.trim() === '') return menuItems;
        const query = searchQuery.toLowerCase();
        return menuItems
            .filter((item) => {
                const labelMatch = item.label.toLowerCase().includes(query);
                const childMatch = item.children?.some((child) => child.label.toLowerCase().includes(query));
                return labelMatch || childMatch;
            })
            .map((item) => {
                if (item.children) {
                    const filteredChildren = item.children.filter(
                        (child) => child.label.toLowerCase().includes(query) || item.label.toLowerCase().includes(query)
                    );
                    return { ...item, children: filteredChildren.length > 0 ? filteredChildren : item.children };
                }
                return item;
            });
    }, [searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const newExpanded: Record<string, boolean> = {};
            menuItems.forEach((item) => {
                if (item.children?.some((child) => child.label.toLowerCase().includes(query))) {
                    newExpanded[item.label] = true;
                }
            });
            setExpandedItems((prev) => ({ ...prev, ...newExpanded }));
        }
    }, [searchQuery]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const toggleSidebar = () => {
        const newCollapsed = !isCollapsed;
        onToggle(newCollapsed);
        if (newCollapsed) setExpandedItems({});
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">🎓</span>
                    {!isCollapsed && <span className="logo-text">EduERP</span>}
                </div>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isCollapsed ? '→' : '←'}
                </button>
            </div>

            {!isCollapsed && (
                <div className="user-badge">
                    <span className="badge">Student</span>
                    <span className="user-id">{userId}</span>
                </div>
            )}

            <nav className="menu">
                {filteredMenuItems.map((item) => {
                    if (item.children && item.children.length > 0) {
                        return (
                            <div key={item.label} className={`menu-group ${expandedItems[item.label] ? 'expanded' : ''}`}>
                                <div className="menu-item parent" onClick={() => toggleExpand(item.label)}>
                                    <span className="icon">{item.icon}</span>
                                    {!isCollapsed && <span className="label">{item.label}</span>}
                                    {!isCollapsed && <span className="arrow">{expandedItems[item.label] ? '▼' : '›'}</span>}
                                </div>
                                {expandedItems[item.label] && !isCollapsed && (
                                    <div className="submenu">
                                        {item.children.map((child) => (
                                            <NavLink key={child.route} to={child.route} className={({ isActive }) => `submenu-item ${isActive ? 'active' : ''}`}>
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return (
                        <NavLink key={item.route} to={item.route!} end={item.route === '/student'} className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
                            <span className="icon">{item.icon}</span>
                            {!isCollapsed && <span className="label">{item.label}</span>}
                        </NavLink>
                    );
                })}
                {filteredMenuItems.length === 0 && searchQuery && (
                    <div className="no-results">No results for "{searchQuery}"</div>
                )}
            </nav>

            {!isCollapsed && (
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}>
                        <span>🚪</span> Logout
                    </button>
                </div>
            )}
        </aside>
    );
}
