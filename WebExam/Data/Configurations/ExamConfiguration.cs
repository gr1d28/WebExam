using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class ExamConfiguration : IEntityTypeConfiguration<Exam>
    {
        public void Configure(EntityTypeBuilder<Exam> builder)
        {
            builder.ToTable("Exams");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(e => e.Description)
                .HasMaxLength(1000);

            builder.Property(e => e.DurationMinutes)
                .IsRequired()
                .HasDefaultValue(60);

            builder.Property(e => e.PassingScore)
                .IsRequired()
                .HasDefaultValue(60);

            builder.Property(e => e.MaxAttempts)
                .IsRequired()
                .HasDefaultValue(1);

            builder.Property(e => e.IsPublished)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(e => e.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(e => e.UpdatedAt)
                .IsRequired(false);

            // Внешний ключ на User
            builder.Property(e => e.CreatedByUserId)
                .IsRequired();

            // Индексы
            builder.HasIndex(e => e.CreatedByUserId);
            builder.HasIndex(e => e.IsPublished);

            // Связи
            builder.HasOne(e => e.CreatedBy)
                .WithMany() // У User нет коллекции Exams, поэтому WithMany() без параметра
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.Questions)
                .WithOne(q => q.Exam)
                .HasForeignKey(q => q.ExamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.ExamSessions)
                .WithOne(es => es.Exam)
                .HasForeignKey(es => es.ExamId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
