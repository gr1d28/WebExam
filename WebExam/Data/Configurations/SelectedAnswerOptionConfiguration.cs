using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WebExam.Models;

namespace WebExam.Data.Configurations
{
    public class SelectedAnswerOptionConfiguration : IEntityTypeConfiguration<SelectedAnswerOption>
    {
        public void Configure(EntityTypeBuilder<SelectedAnswerOption> builder)
        {
            builder.ToTable("SelectedAnswerOptions");

            builder.HasKey(sao => sao.Id);

            // Составной уникальный индекс
            builder.HasIndex(sao => new { sao.UserAnswerId, sao.AnswerOptionId })
                .IsUnique();

            // Связи
            builder.HasOne(sao => sao.UserAnswer)
                .WithMany(ua => ua.SelectedOptions)
                .HasForeignKey(sao => sao.UserAnswerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sao => sao.AnswerOption)
                .WithMany()
                .HasForeignKey(sao => sao.AnswerOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
