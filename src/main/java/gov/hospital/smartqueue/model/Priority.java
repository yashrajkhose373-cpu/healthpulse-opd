package gov.hospital.smartqueue.model;

public enum Priority {
    EMERGENCY(1, "Emergency"),
    SENIOR_OR_PREGNANT(2, "Senior Citizen / Pregnant Woman"),
    NORMAL(3, "Normal");

    private final int rank;
    private final String displayName;

    Priority(int rank, String displayName) {
        this.rank = rank;
        this.displayName = displayName;
    }

    public int getRank() {
        return rank;
    }

    public String getDisplayName() {
        return displayName;
    }
}
