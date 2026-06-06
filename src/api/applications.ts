import { request } from "./client";
import type { Application, ApplicationInput } from "../types";

export function getApplications() {
    return request<Application[]>("/applications");
}

export function getApplication(id: number) {
    return request<Application>(`/applications/${id}`);
}

export function createApplication(body: ApplicationInput) {
    return request<Application>("/applications", {
        method: "POST",
        body: JSON.stringify(body),
    });
}

export function updateApplication(id: number, body: ApplicationInput) {
    return request<Application>(`/applications/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });
}

export function deleteApplication(id: number) {
    return request<void>(`/applications/${id}`, { method: "DELETE" });
}